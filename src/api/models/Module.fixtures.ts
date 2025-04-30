import type { Module } from "+api/models/Module"
import type { DummySuiteId } from "+api/models/Suite.fixtures"
import type { DummyTestId } from "+api/models/Test.fixtures"
import { type Path, getFilenameFromPath } from "+types/Path"

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

export type DummyModuleId =
	| "15b021ef72"
	| "3afdd8b6c3"
	| "-1730f876b4"
	| "-e45b128829"

export type NonExistingDummyModuleId =
	| "134672b00e"
	| "29bb9e8bc0"
	| "-20e94f4789"
	| "6ab50b9861"

const dummyPathsById: Record<DummyModuleId | NonExistingDummyModuleId, Path> = {
	"15b021ef72":
		"/Users/spdiswal/repositories/plantation/src/orchard/Apples.tests.ts",
	"3afdd8b6c3":
		"/Users/spdiswal/repositories/plantation/src/shipping/Bananas.tests.ts",
	"-1730f876b4":
		"/Users/spdiswal/repositories/plantation/src/basket/Oranges.tests.ts",
	"-e45b128829":
		"/Users/spdiswal/repositories/plantation/src/supermarket/Peaches.tests.ts",
	"134672b00e": "/Users/spdiswal/repositories/plantation/src/Cherries.tests.ts",
	"29bb9e8bc0":
		"/Users/spdiswal/repositories/plantation/src/Strawberries.tests.ts",
	"-20e94f4789": "/Users/spdiswal/repositories/plantation/src/Grapes.tests.ts",
	"6ab50b9861": "/Users/spdiswal/repositories/plantation/src/Lemons.tests.ts",
}

export function dummyModuleFilename(
	moduleId: DummyModuleId | NonExistingDummyModuleId,
): string {
	return getFilenameFromPath(dummyModulePath(moduleId))
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
