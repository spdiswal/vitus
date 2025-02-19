import type { Path } from "+types/Path"
import type { SuiteId } from "+types/SuiteId"
import type { TestId } from "+types/TestId"
import type { TestCase, TestState } from "vitest/node"

export type TestEvent = {
	scope: "test"
	status: TestEventStatus
	filePath: Path
	parentSuiteId: SuiteId | null
	testId: TestId
	testName: string
}

export type TestEventStatus = "failed" | "passed" | "skipped" | "started"

const statusMap = {
	failed: "failed",
	passed: "passed",
	pending: "started",
	skipped: "skipped",
} as const satisfies Record<TestState, TestEventStatus>

export function mapToTestEvent(
	test: TestCase,
	overrideStatus?: TestEventStatus,
): TestEvent {
	const parent = test.parent

	return {
		scope: "test",
		status: overrideStatus ?? statusMap[test.result().state],
		filePath: test.module.moduleId,
		parentSuiteId: parent.type === "suite" ? parent.id : null,
		testId: test.id,
		testName: test.name,
	}
}
