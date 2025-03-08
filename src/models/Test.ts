import { type Suite, isSuite, mapVitestToSuitePath } from "+models/Suite"
import { type TestPath, getTestIdFromTestPath } from "+models/TestPath"
import type { Computed, PickNonComputed } from "+types/Computed"
import type { Duration } from "+types/Duration"
import type { TestCase, TestState } from "vitest/node"

export type Test = {
	id: Computed<TestId>
	duration: Duration
	name: string
	path: TestPath
	status: TestStatus
}

export type TestId = string
export type TestStatus = "failed" | "passed" | "running" | "skipped"

export function newTest(props: PickNonComputed<Test>): Test {
	return { ...props, id: getTestIdFromTestPath(props.path) }
}

export function isTest(suiteOrTest: Suite | Test): suiteOrTest is Test {
	return !isSuite(suiteOrTest)
}

const statusMap: Record<TestState, TestStatus> = {
	failed: "failed",
	passed: "passed",
	pending: "running",
	skipped: "skipped",
}

export function mapVitestToTest(test: TestCase): Test {
	return newTest({
		duration: test.diagnostic()?.duration ?? 0,
		name: test.name,
		path: mapVitestToTestPath(test),
		status: statusMap[test.result().state],
	})
}

export function mapVitestToTestPath(test: TestCase): TestPath {
	return test.parent.type === "module"
		? [test.parent.id, test.id]
		: [...mapVitestToSuitePath(test.parent), test.id]
}
