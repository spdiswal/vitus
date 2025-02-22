import type { Test, TestId, Tests } from "+models/Test"
import type { Comparator } from "+types/Comparator"
import type { Computed, PickNonComputed } from "+types/Computed"
import type { Duration } from "+types/Duration"
import type { Path } from "+types/Path"

export type File = {
	id: FileId
	duration: Duration
	filename: Computed<string>
	path: Path
	status: FileStatus
	tests: Tests
}

export type Files = Array<File>

export type FileId = string
export type FileIds = Array<FileId>
export type FileStatus = "failed" | "passed" | "running" | "skipped"

const byTestId: Comparator<Test> = (a, b) =>
	a.id.localeCompare(b.id, undefined, { numeric: true })

export function newFile(props: PickNonComputed<File>): File {
	const tests = props.tests.toSorted(byTestId)

	return {
		...props,
		tests,
		filename: props.path.slice(props.path.lastIndexOf("/") + 1),
	}
}

export function getTopLevelTestById(file: File, testId: TestId): Test | null {
	return file.tests.find((test) => test.id === testId) ?? null
}

export function putTopLevelTest(file: File, newTest: Test): File {
	const targetIndex = file.tests.findIndex((test) => test.id === newTest.id)

	const tests: Tests =
		targetIndex === -1
			? [...file.tests, newTest]
			: file.tests.with(targetIndex, newTest)

	return newFile({ ...file, tests })
}
