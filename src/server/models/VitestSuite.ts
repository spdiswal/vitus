import type { Suite } from "+api/models/Suite"
import { getTaskStatusFromVitest } from "+api/models/TaskStatus"
import type { VitestModule } from "+server/models/VitestModule"
import type { VitestTest } from "+server/models/VitestTest"
import { toSum } from "+utilities/Arrays"
import type { TestSuite, TestSuiteState } from "vitest/node"

/**
 * A subset of {@link TestSuite} that is easier to mock in unit tests.
 */
export type VitestSuite = Pick<
	TestSuite,
	"id" | "module" | "name" | "state" | "type"
> & {
	children: {
		allTests: () => Iterable<VitestTest>
	}
	parent: VitestModule | VitestSuite
}

export function newSuiteFromVitest(
	suite: VitestSuite,
	overrides?: { status?: TestSuiteState },
): Suite {
	const testDurationSum = Array.from(suite.children.allTests())
		.map((test) => test.diagnostic()?.duration ?? 0)
		.reduce(toSum, 0)

	return {
		type: "suite",
		id: suite.id,
		parentId: suite.parent.id,
		parentModuleId: suite.module.id,
		name: suite.name,
		status: getTaskStatusFromVitest(
			overrides?.status ?? suite.state(),
			testDurationSum,
		),
	}
}
