import { dummyParentIds } from "+api/models/FileDto.fixtures"
import {
	type DummySuiteId,
	getDummySuiteName,
} from "+api/models/SuiteDto.fixtures"
import { dummyVitestModule } from "+server/models/VitestModule.fixtures"
import type { VitestSuite } from "+server/models/VitestSuite"
import type { SerializedError } from "vitest"
import type { TestCase, TestSuite, TestSuiteState } from "vitest/node"

export function dummyVitestSuite(
	id: DummySuiteId,
	overrides?: Partial<{
		status: TestSuiteState
	}>,
): TestSuite {
	const [parentFileId, parentSuiteId] = dummyParentIds(id)

	const parentModule = dummyVitestModule(parentFileId)
	const parentSuite =
		parentSuiteId !== null ? dummyVitestSuite(parentSuiteId) : null

	return {
		type: "suite",
		id,
		name: getDummySuiteName(id).at(-1) as string,
		module: parentModule,
		parent: parentSuite ?? parentModule,
		state: (): TestSuiteState => overrides?.status ?? "pending",
		errors(): Array<SerializedError> {
			return []
		},
		children: {
			allTests(): Iterable<TestCase> {
				return []
			},
		},
	} satisfies VitestSuite as TestSuite
}
