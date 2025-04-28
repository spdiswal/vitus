import type { Module } from "+models/Module"
import type { DummySuiteId } from "+models/Suite.fixtures"
import type { DummyTestId } from "+models/Test.fixtures"
import { type Path, getFilenameFromPath } from "+types/Path"
import type {
	TestModule,
	TestModuleState,
	TestSpecification,
} from "vitest/node"

export function dummyModule(
	moduleId: DummyModuleId | NonExistingDummyModuleId,
	overrides?: Partial<Module>,
): Module {
	return {
		type: "module",
		id: moduleId,
		path: dummyModulePath(moduleId),
		filename: getFilenameFromPath(moduleId),
		status: "passed",
		...overrides,
	}
}

export function dummyVitestSpecification(
	moduleId: DummyModuleId,
): TestSpecification {
	return {
		moduleId: dummyPathsById[moduleId],
		get testModule(): TestModule {
			return dummyVitestModule(moduleId)
		},
	} as TestSpecification
}

export function dummyVitestModule(
	moduleId: DummyModuleId,
	overrides?: Partial<{ status: TestModuleState }>,
): TestModule {
	return {
		type: "module",
		diagnostic: () => ({ duration: 0 }),
		id: moduleId,
		moduleId: dummyModulePath(moduleId),
		state: () => overrides?.status ?? "pending",
	} as TestModule
}

export type DummyModuleId =
	| "15b021ef72"
	| "3afdd8b6c3"
	| "-1730f876b4"
	| "-e45b128829"

export type NonExistingDummyModuleId = "f9bb9e8bc0"

const dummyPathsById: Record<DummyModuleId | NonExistingDummyModuleId, Path> = {
	"15b021ef72":
		"/Users/spdiswal/repositories/plantation/src/orchard/Apples.tests.ts",
	"3afdd8b6c3":
		"/Users/spdiswal/repositories/plantation/src/shipping/Bananas.tests.ts",
	"-1730f876b4":
		"/Users/spdiswal/repositories/plantation/src/basket/Oranges.tests.ts",
	"-e45b128829":
		"/Users/spdiswal/repositories/plantation/src/supermarket/Peaches.tests.ts",
	f9bb9e8bc0:
		"/Users/spdiswal/repositories/plantation/src/basket/Imaginary.tests.ts",
}

export function dummyModulePath(
	moduleId: DummyModuleId | NonExistingDummyModuleId,
): Path {
	return dummyPathsById[moduleId]
}

export function dummyParentIds(
	id: DummySuiteId | DummyTestId,
): [DummyModuleId, DummySuiteId | null] {
	const moduleId = id.slice(0, id.indexOf("_"))
	const parentSuiteId = id.slice(0, id.lastIndexOf("_"))

	return [
		moduleId as DummyModuleId,
		parentSuiteId !== moduleId ? (parentSuiteId as DummySuiteId) : null,
	]
}
