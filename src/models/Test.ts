import type { FileId } from "+models/File"
import type { Computed, PickNonComputed } from "+types/Computed"
import type { Duration } from "+types/Duration"

export type Test = {
	id: Computed<TestId>
	duration: Duration
	name: string
	path: TestPath
	status: TestStatus
}

export type Tests = Array<Test>

export type TestId = string
export type TestIds = Array<TestId>
export type TestPath = [FileId, TestId]
export type TestStatus = "failed" | "passed" | "running" | "skipped"

export function newTest(test: PickNonComputed<Test>): Test {
	const [, testId] = test.path
	return { ...test, id: testId }
}
