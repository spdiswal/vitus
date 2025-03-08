import {
	type Suite,
	type SuiteId,
	countSuiteChildren,
	dropUnfinishedSuiteChildren,
	getSuiteChildIds,
	hasNotSuiteOrTestStatus,
	isSuite,
	mapVitestToSuiteOrTest,
} from "+models/Suite"
import { type Test, type TestId, isTest } from "+models/Test"
import type { Comparator } from "+types/Comparator"
import type { Computed, PickNonComputed } from "+types/Computed"
import type { Duration } from "+types/Duration"
import { type Path, getFilenameFromPath } from "+types/Path"
import { toSum } from "+utilities/Arrays"
import type { TestModule, TestModuleState } from "vitest/node"

export type File = {
	id: FileId
	duration: Duration
	filename: Computed<string>
	path: Path
	status: FileStatus
	suitesAndTests: Array<Suite | Test>
}

export type Files = Array<File>

export type FileId = string
export type FileIds = Array<FileId>
export type FileStatus = "failed" | "passed" | "running" | "skipped"

const bySuiteOrTestId: Comparator<Suite | Test> = (a, b) =>
	a.id.localeCompare(b.id, undefined, { numeric: true })

export function newFile(props: PickNonComputed<File>): File {
	return {
		...props,
		suitesAndTests: props.suitesAndTests.toSorted(bySuiteOrTestId),
		filename: getFilenameFromPath(props.path),
	}
}

export function hasFileStatus(status: FileStatus): (file: File) => boolean {
	return (file): boolean => file.status === status
}

export function hasNotFileStatus(status: FileStatus): (file: File) => boolean {
	return (file): boolean => file.status !== status
}

export function countFileChildren(file: File): number {
	return (
		file.suitesAndTests.length +
		file.suitesAndTests.filter(isSuite).map(countSuiteChildren).reduce(toSum, 0)
	)
}

export function getFileChildIds(file: File): Array<string> {
	return file.suitesAndTests.flatMap((suiteOrTest) =>
		isSuite(suiteOrTest)
			? [suiteOrTest.id, ...getSuiteChildIds(suiteOrTest)]
			: [suiteOrTest.id],
	)
}

export function getTopLevelSuiteById(
	parentFile: File,
	suiteId: SuiteId,
): Suite | null {
	return (
		parentFile.suitesAndTests.find(
			(suiteOrTest): suiteOrTest is Suite =>
				suiteOrTest.id === suiteId && isSuite(suiteOrTest),
		) ?? null
	)
}

export function getTopLevelTestById(
	parentFile: File,
	testId: TestId,
): Test | null {
	return (
		parentFile.suitesAndTests.find(
			(suiteOrTest): suiteOrTest is Test =>
				suiteOrTest.id === testId && isTest(suiteOrTest),
		) ?? null
	)
}

export function putTopLevelSuiteOrTest(
	parentFile: File,
	suiteOrTestToInsert: Suite | Test,
): File {
	const existingSuiteOrTestIndex = parentFile.suitesAndTests.findIndex(
		(suiteOrTest) => suiteOrTest.id === suiteOrTestToInsert.id,
	)

	const suitesAndTests: Array<Suite | Test> =
		existingSuiteOrTestIndex === -1
			? [...parentFile.suitesAndTests, suiteOrTestToInsert]
			: parentFile.suitesAndTests.with(
					existingSuiteOrTestIndex,
					suiteOrTestToInsert,
				)

	return newFile({ ...parentFile, suitesAndTests })
}

export function dropUnfinishedFileChildren(file: File): File {
	return newFile({
		...file,
		suitesAndTests: file.suitesAndTests
			.filter(hasNotSuiteOrTestStatus("running"))
			.map((suiteOrTest) =>
				isSuite(suiteOrTest)
					? dropUnfinishedSuiteChildren(suiteOrTest)
					: suiteOrTest,
			),
	})
}

const statusMap: Record<TestModuleState, FileStatus> = {
	failed: "failed",
	passed: "passed",
	pending: "running",
	queued: "running",
	skipped: "skipped",
}

export function mapVitestToFile(module: TestModule): File {
	return newFile({
		id: module.id,
		duration: module.diagnostic().duration,
		path: module.moduleId,
		status: statusMap[module.state()],
		suitesAndTests: module.children.array().map(mapVitestToSuiteOrTest),
	})
}
