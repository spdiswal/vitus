import {
	type Suite,
	type SuiteId,
	countSuiteChildren,
	dropUnfinishedSuiteChildren,
	getSuiteChildIds,
	isSuite,
} from "+models/Suite"
import { type Test, type TestId, isTest } from "+models/Test"
import type { Comparator } from "+types/Comparator"
import type { Computed, PickNonComputed } from "+types/Computed"
import type { Duration } from "+types/Duration"
import type { Path } from "+types/Path"
import { toSum } from "+utilities/Arrays"
import { count } from "+utilities/Strings"

export type File = {
	id: FileId
	duration: Duration
	filename: Computed<string>
	path: Path
	status: FileStatus
	children: Array<Suite | Test>
}

export type Files = Array<File>

export type FileId = string
export type FileIds = Array<FileId>
export type FileStatus = "failed" | "passed" | "running" | "skipped"

const byChildId: Comparator<Suite | Test> = (a, b) =>
	a.id.localeCompare(b.id, undefined, { numeric: true })

export function newFile(props: PickNonComputed<File>): File {
	return {
		...props,
		children: props.children.toSorted(byChildId),
		filename: props.path.slice(props.path.lastIndexOf("/") + 1),
	}
}

export function countFileChildren(file: File): number {
	return (
		file.children.length +
		file.children.filter(isSuite).map(countSuiteChildren).reduce(toSum, 0)
	)
}

export function getFileChildIds(file: File): Array<string> {
	return file.children.flatMap((child) =>
		isSuite(child) ? [child.id, ...getSuiteChildIds(child)] : [child.id],
	)
}

export function getTopLevelSuiteById(
	file: File,
	suiteId: SuiteId,
): Suite | null {
	return (
		file.children.find(
			(child): child is Suite => child.id === suiteId && isSuite(child),
		) ?? null
	)
}

export function putTopLevelSuiteOrTest(
	file: File,
	newSuiteOrTest: Suite | Test,
): File {
	const targetIndex = file.children.findIndex(
		(child) => child.id === newSuiteOrTest.id,
	)

	const children: Array<Suite | Test> =
		targetIndex === -1
			? [...file.children, newSuiteOrTest]
			: file.children.with(targetIndex, newSuiteOrTest)

	return newFile({ ...file, children })
}

export function getTopLevelTestById(file: File, testId: TestId): Test | null {
	return (
		file.children.find(
			(child): child is Test => child.id === testId && isTest(child),
		) ?? null
	)
}

export function dropUnfinishedFileChildren(file: File): File {
	return newFile({
		...file,
		children: file.children
			.filter((child) => child.status !== "running")
			.map((child) =>
				isSuite(child) ? dropUnfinishedSuiteChildren(child) : child,
			),
	})
}

export function assertFileChildCount(
	file: File,
	expectedChildCount: number,
): void {
	const actualChildCount = countFileChildren(file)
	if (actualChildCount !== expectedChildCount) {
		throw new Error(
			`Expected the file to have ${count(expectedChildCount, "child", "children")}, but got ${count(actualChildCount, "child", "children")}: ${getFileChildIds(file).join(", ")}`,
		)
	}
}
