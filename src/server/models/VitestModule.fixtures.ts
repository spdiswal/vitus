import {
	type DummyModuleId,
	dummyModulePath,
} from "+api/models/ModuleDto.fixtures"
import type {
	VitestModule,
	VitestModuleDiagnostic,
} from "+server/models/VitestModule"
import type { Duration } from "+types/Duration"
import type { SerializedError } from "vitest"
import type {
	TestCase,
	TestModule,
	TestModuleState,
	TestSpecification,
	TestSuite,
} from "vitest/node"

export function dummyVitestSpecification(
	moduleId: DummyModuleId,
): TestSpecification {
	return {
		moduleId: dummyModulePath(moduleId),
		get testModule(): TestModule {
			return dummyVitestModule(moduleId)
		},
	} as TestSpecification
}

export function dummyVitestModule(
	moduleId: DummyModuleId,
	overrides?: Partial<{
		duration: Duration
		status: TestModuleState
	}>,
): TestModule {
	return {
		type: "module",
		id: moduleId,
		moduleId: dummyModulePath(moduleId),
		state: (): TestModuleState => overrides?.status ?? "pending",
		diagnostic: (): VitestModuleDiagnostic => ({
			environmentSetupDuration: 0,
			prepareDuration: 0,
			collectDuration: 0,
			setupDuration: 0,
			duration: overrides?.duration ?? 0,
		}),
		errors(): Array<SerializedError> {
			return []
		},
		children: {
			allSuites(): Iterable<TestSuite> {
				return []
			},
			allTests(): Iterable<TestCase> {
				return []
			},
		},
	} satisfies VitestModule as TestModule
}
