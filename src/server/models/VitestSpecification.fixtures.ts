import {
	type DummyModuleId,
	dummyModulePath,
} from "+api/models/Module.fixtures"
import { dummyVitestModule } from "+server/models/VitestModule.fixtures"
import type { VitestSpecification } from "+server/models/VitestSpecification"
import type { TestModule, TestSpecification } from "vitest/node"

export function dummyVitestSpecification(
	moduleId: DummyModuleId,
): TestSpecification {
	return {
		moduleId: dummyModulePath(moduleId),
		get testModule(): TestModule {
			return dummyVitestModule(moduleId, { status: "pending" })
		},
	} satisfies VitestSpecification as TestSpecification
}
