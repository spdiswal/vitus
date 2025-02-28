import {
	type File,
	type FileId,
	type Files,
	getFileChildIds,
} from "+models/File"
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

export function getFileById(project: Project, id: FileId): File | null {
	return project.files.find((file) => file.id === id) ?? null
}

export function getOtherFiles(project: Project, excludedId: FileId): Files {
	return project.files.filter((file) => file.id !== excludedId)
}

export function getProjectChildIds(project: Project): Array<string> {
	return project.files.flatMap((file) => [file.id, ...getFileChildIds(file)])
}

export function putFile(project: Project, updatedFile: File): Project {
	const targetIndex = project.files.findIndex(
		(file) => file.id === updatedFile.id,
	)

	const files: Files =
		targetIndex === -1
			? [...project.files, updatedFile]
			: project.files.with(targetIndex, updatedFile)

	return newProject({ ...project, files })
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
