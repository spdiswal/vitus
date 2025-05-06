import { dummyParentIds } from "+api/models/Module.fixtures"
import { type DummySuiteId, dummySuiteName } from "+api/models/Suite.fixtures"
import { dummyVitestModule } from "+server/models/VitestModule.fixtures"
import type { VitestSuite } from "+server/models/VitestSuite"
import type { VitestTest } from "+server/models/VitestTest"
import type { TestSuite, TestSuiteState } from "vitest/node"

export function dummyVitestSuite(
	suiteId: DummySuiteId,
	props: {
		status: TestSuiteState
		children?: Iterable<VitestTest>
	},
): TestSuite {
	const [parentModuleId, parentSuiteId] = dummyParentIds(suiteId)

	const parentModule = dummyVitestModule(parentModuleId, { status: "pending" })
	const parentSuite =
		parentSuiteId !== null
			? dummyVitestSuite(parentSuiteId, { status: "pending" })
			: null

	return {
		type: "suite",
		id: suiteId,
		name: dummySuiteName(suiteId),
		module: parentModule,
		parent: parentSuite ?? parentModule,
		state: (): TestSuiteState => props.status,
		children: {
			allTests(): Iterable<VitestTest> {
				return props.children ?? []
			},
		},
	} satisfies VitestSuite as TestSuite
}
