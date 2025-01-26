import type { FilePath } from "+types/FilePath"
import type { SuiteId } from "+types/SuiteId"
import type { TestId } from "+types/TestId"
import type { TestCase, TestState } from "vitest/node"

export type TestEvent = {
	scope: "test"
	status: TestEventStatus
	filePath: FilePath
	parentSuiteId: SuiteId | null
	testId: TestId
	testName: string
}

export type TestEventStatus = "failed" | "passed" | "skipped" | "started"

export function mapToTestEvent(
	test: TestCase,
	overrideStatus?: TestEventStatus,
): TestEvent {
	const parent = test.parent

	return {
		scope: "test",
		status: overrideStatus ?? mapStatus(test.result().state),
		filePath: test.module.moduleId,
		parentSuiteId: parent.type === "suite" ? parent.id : null,
		testId: test.id,
		testName: test.name,
	}
}

function mapStatus(status: TestState): TestEventStatus {
	switch (status) {
		case "pending": {
			return "started"
		}
		default:
			return status
	}
}
