import {
	type File,
	type FileId,
	type Files,
	getFileChildIds,
	getTopLevelSuiteById,
	getTopLevelTestById,
	putTopLevelSuiteOrTest,
} from "+models/File"
import {
	type Suite,
	type SuiteIds,
	type SuitePath,
	getDeeplyNestedSuiteByPath,
	getNestedTestById,
	hasNestedSuites,
	putDeeplyNestedSuiteOrTest,
	putNestedSuiteOrTest,
} from "+models/Suite"
import type { Test, TestId, TestPath } from "+models/Test"
import type { Comparator } from "+types/Comparator"
import type { Computed, PickNonComputed } from "+types/Computed"
import type { Duration } from "+types/Duration"
import type { Path } from "+types/Path"
import { toSum } from "+utilities/Arrays"
import { count } from "+utilities/Strings"

export type Project = {
	duration: Computed<Duration>
	files: Files
	isConnected: boolean
	rootPath: Path
	status: Computed<ProjectStatus>
}

export type ProjectStatus = "failed" | "passed" | "running"

const byFilename: Comparator<File> = (a, b) =>
	a.filename.localeCompare(b.filename)

export function newProject(props: PickNonComputed<Project>): Project {
	const files = props.files.toSorted(byFilename)

	return {
		...props,
		files,
		duration: files.map((file) => file.duration).reduce(toSum, 0),
		status: files.some((file) => file.status === "running")
			? "running"
			: files.some((file) => file.status === "failed")
				? "failed"
				: "passed",
	}
}

export function getFileById(project: Project, fileId: FileId): File | null {
	return project.files.find((file) => file.id === fileId) ?? null
}

export function getOtherFiles(project: Project, excludedFileId: FileId): Files {
	return project.files.filter((file) => file.id !== excludedFileId)
}

export function getProjectChildIds(project: Project): Array<string> {
	return project.files.flatMap((file) => [file.id, ...getFileChildIds(file)])
}

export function putFile(project: Project, fileToInsert: File): Project {
	const existingFileIndex = project.files.findIndex(
		(file) => file.id === fileToInsert.id,
	)

	const files: Files =
		existingFileIndex === -1
			? [...project.files, fileToInsert]
			: project.files.with(existingFileIndex, fileToInsert)

	return newProject({ ...project, files })
}

export function getSuiteByPath(
	project: Project,
	suitePath: SuitePath,
): Suite | null {
	const [fileId, topLevelSuiteId, ...remainingPath] = suitePath

	const parentFile = getFileById(project, fileId)

	if (parentFile === null) {
		return null
	}

	const topLevelSuite = getTopLevelSuiteById(parentFile, topLevelSuiteId)

	return !hasNestedSuites(remainingPath) || topLevelSuite === null
		? topLevelSuite
		: getDeeplyNestedSuiteByPath(topLevelSuite, remainingPath)
}

export function putSuite(project: Project, suiteToInsert: Suite): Project {
	const [fileId, topLevelSuiteId, ...remainingPath] = suiteToInsert.path

	const parentFile = getFileById(project, fileId)

	if (parentFile === null) {
		return project
	}
	if (!hasNestedSuites(remainingPath)) {
		const updatedFile = putTopLevelSuiteOrTest(parentFile, suiteToInsert)
		return putFile(project, updatedFile)
	}

	const topLevelSuite = getTopLevelSuiteById(parentFile, topLevelSuiteId)

	if (topLevelSuite === null) {
		return project
	}

	const updatedTopLevelSuite = putDeeplyNestedSuiteOrTest(
		topLevelSuite,
		remainingPath,
		suiteToInsert,
	)

	const updatedFile = putTopLevelSuiteOrTest(parentFile, updatedTopLevelSuite)
	return putFile(project, updatedFile)
}

export function getTestByPath(
	project: Project,
	testPath: TestPath,
): Test | null {
	const [fileId, ...suiteAndTestIds] = testPath
	const testId = suiteAndTestIds.pop() as TestId
	const suiteIds = suiteAndTestIds as SuiteIds

	const parentFile = getFileById(project, fileId)

	if (parentFile === null) {
		return null
	}
	if (!hasNestedSuites(suiteIds)) {
		return getTopLevelTestById(parentFile, testId)
	}

	const [topLevelSuiteId, ...remainingPath] = suiteIds

	const topLevelSuite = getTopLevelSuiteById(parentFile, topLevelSuiteId)
	const parentSuite =
		!hasNestedSuites(remainingPath) || topLevelSuite === null
			? topLevelSuite
			: getDeeplyNestedSuiteByPath(topLevelSuite, remainingPath)

	if (parentSuite === null) {
		return null
	}

	return getNestedTestById(parentSuite, testId)
}

export function putTest(project: Project, testToInsert: Test): Project {
	const [fileId, ...suiteAndTestIds] = testToInsert.path
	suiteAndTestIds.pop()
	const suiteIds = suiteAndTestIds as SuiteIds

	const parentFile = getFileById(project, fileId)

	if (parentFile === null) {
		return project
	}
	if (!hasNestedSuites(suiteIds)) {
		const updatedFile = putTopLevelSuiteOrTest(parentFile, testToInsert)
		return putFile(project, updatedFile)
	}

	const [topLevelSuiteId, ...remainingPath] = suiteIds
	const topLevelSuite = getTopLevelSuiteById(parentFile, topLevelSuiteId)

	if (topLevelSuite === null) {
		return project
	}

	const updatedTopLevelSuite = hasNestedSuites(remainingPath)
		? putDeeplyNestedSuiteOrTest(topLevelSuite, remainingPath, testToInsert)
		: putNestedSuiteOrTest(topLevelSuite, testToInsert)

	const updatedFile = putTopLevelSuiteOrTest(parentFile, updatedTopLevelSuite)
	return putFile(project, updatedFile)
}

export function assertProjectDuration(
	project: Project,
	expectedDuration: Duration,
): void {
	const actualDuration = project.duration
	if (actualDuration !== expectedDuration) {
		throw new Error(
			`Expected the project to have a duration of ${expectedDuration} ms, but was ${actualDuration} ms`,
		)
	}
}

export function assertProjectFileCount(
	project: Project,
	expectedFileCount: number,
): void {
	const actualFileCount = project.files.length
	if (actualFileCount !== expectedFileCount) {
		throw new Error(
			`Expected the project to have ${count(expectedFileCount, "file", "files")}, but got ${count(actualFileCount, "file", "files")}`,
		)
	}
}

export function assertProjectStatus(
	project: Project,
	expectedStatus: ProjectStatus,
): void {
	const actualStatus = project.status
	if (actualStatus !== expectedStatus) {
		throw new Error(
			`Expected the project to have status '${expectedStatus}', but was '${actualStatus}'`,
		)
	}
}
