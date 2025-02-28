import type { FileId } from "+models/File"
import type { Suite, SuiteIds, isSuite } from "+models/Suite"
import type { Computed, PickNonComputed } from "+types/Computed"
import type { Duration } from "+types/Duration"
import type { LastItemOf } from "+utilities/Arrays"

export type Test = {
	id: Computed<TestId>
	duration: Duration
	name: string
	path: TestPath
	status: TestStatus
}

export type TestId = string
export type TestPath = [FileId, ...SuiteIds, TestId]
export type TestStatus = "failed" | "passed" | "running" | "skipped"

export function newTest(test: PickNonComputed<Test>): Test {
	const testId = test.path.at(-1) as LastItemOf<TestPath>
	return { ...test, id: testId }
}

export function isTest(suiteOrTest: Suite | Test): suiteOrTest is Test {
	return !isSuite(suiteOrTest)
}
