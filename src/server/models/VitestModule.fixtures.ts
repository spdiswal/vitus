import {
	type DummyModuleId,
	dummyModulePath,
} from "+api/models/Module.fixtures"
import type {
	VitestModule,
	VitestModuleDiagnostic,
} from "+server/models/VitestModule"
import type {
	TestCase,
	TestModule,
	TestModuleState,
	TestSuite,
} from "vitest/node"

export function dummyVitestModule(
	moduleId: DummyModuleId,
	props: { status: TestModuleState },
): TestModule {
	return {
		type: "module",
		id: moduleId,
		moduleId: dummyModulePath(moduleId),
		state: (): TestModuleState => props.status,
		diagnostic: (): VitestModuleDiagnostic => ({
			environmentSetupDuration: 0,
			prepareDuration: 0,
			collectDuration: 0,
			setupDuration: 0,
			duration: 0,
			heap: 0,
		}),
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
