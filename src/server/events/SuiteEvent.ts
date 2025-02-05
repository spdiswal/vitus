import type { FilePath } from "+types/FilePath"
import type { SuiteId } from "+types/SuiteId"
import type { TestSuite, TestSuiteState } from "vitest/node"

export type SuiteEvent = {
	scope: "suite"
	status: SuiteEventStatus
	filePath: FilePath
	parentSuiteId: SuiteId | null
	suiteId: SuiteId
	suiteName: string
}

export type SuiteEventStatus = "failed" | "passed" | "skipped" | "started"

const statusMap = {
	failed: "failed",
	passed: "passed",
	pending: "started",
	skipped: "skipped",
} as const satisfies Record<TestSuiteState, SuiteEventStatus>

export function mapToSuiteEvent(
	suite: TestSuite,
	overrideStatus?: SuiteEventStatus,
): SuiteEvent {
	const parent = suite.parent

	return {
		scope: "suite",
		status: overrideStatus ?? statusMap[suite.state()],
		filePath: suite.module.moduleId,
		parentSuiteId: parent.type === "suite" ? parent.id : null,
		suiteId: suite.id,
		suiteName: suite.name,
	}
}
