import type { FileId } from "+models/File"
import type { Suite, SuiteId, SuiteIds, SuitePath, isSuite } from "+models/Suite"
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

export function newTest(props: PickNonComputed<Test>): Test {
	const testId = props.path.at(-1) as LastItemOf<TestPath>
	return { ...props, id: testId }
}

export function isTest(suiteOrTest: Suite | Test): suiteOrTest is Test {
	return !isSuite(suiteOrTest)
}

export function getParentSuitePath(testPath: TestPath): SuitePath | null {
	return hasParentSuite(testPath) ? (testPath.slice(0, -1) as SuitePath) : null
}

export function hasParentSuite(
	testPath: TestPath,
): testPath is [FileId, ...SuiteIds, SuiteId, TestId] {
	return testPath.length > 2
}
