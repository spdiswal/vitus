import type { Suite } from "+api/models/Suite"
import type { VitestModule } from "+server/models/VitestModule"
import type { VitestTest } from "+server/models/VitestTest"
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
	const vitestStatus = overrides?.status ?? suite.state()
	const status = vitestStatus === "pending" ? "started" : vitestStatus

	return {
		type: "suite",
		id: suite.id,
		parentId: suite.parent.id,
		parentModuleId: suite.module.id,
		name: suite.name,
		status,
	}
}
