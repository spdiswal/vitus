import {
	type DummyFileId,
	getDummyFilePath,
} from "+api/models/FileDto.fixtures"
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
	fileId: DummyFileId,
): TestSpecification {
	return {
		moduleId: getDummyFilePath(fileId),
		get testModule(): TestModule {
			return dummyVitestModule(fileId)
		},
	} as TestSpecification
}

export function dummyVitestModule(
	fileId: DummyFileId,
	overrides?: Partial<{
		duration: Duration
		status: TestModuleState
	}>,
): TestModule {
	return {
		type: "module",
		id: fileId,
		moduleId: getDummyFilePath(fileId),
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
