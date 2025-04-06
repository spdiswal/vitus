import type { ModuleDto } from "+api/models/ModuleDto"
import type { DummySuiteId } from "+api/models/SuiteDto.fixtures"
import type { DummyTestId } from "+api/models/TestDto.fixtures"

export function dummyModuleDto(
	id: DummyModuleId,
	overrides?: Partial<Omit<ModuleDto, "type" | "id">>,
): ModuleDto {
	return {
		type: "module",
		id,
		path: dummyModulePath(id),
		status: "passed",
		duration: 1,
		errors: [],
		...overrides,
	}
}

export type DummyModuleId =
	| "15b021ef72"
	| "a3fdd8b6c3"
	| "-1730f876b4"
	| "-e45b128829"

const dummyPathsById: Record<DummyModuleId, string> = {
	"15b021ef72":
		"/Users/spdiswal/repositories/plantation/src/orchard/Apples.tests.ts",
	a3fdd8b6c3:
		"/Users/spdiswal/repositories/plantation/src/shipping/Bananas.tests.ts",
	"-1730f876b4":
		"/Users/spdiswal/repositories/plantation/src/basket/Oranges.tests.ts",
	"-e45b128829":
		"/Users/spdiswal/repositories/plantation/src/supermarket/Peaches.tests.ts",
}

export function dummyModulePath(moduleId: DummyModuleId): string {
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
