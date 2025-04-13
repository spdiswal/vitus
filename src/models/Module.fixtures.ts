import { type Module, newModule } from "+models/Module"
import type { Suite } from "+models/Suite"
import type { Test } from "+models/Test"
import type { Duration } from "+types/Duration"
import type { Path } from "+types/Path"
import type {
	TestModule,
	TestModuleState,
	TestSpecification,
} from "vitest/node"

export function dummyModule(
	moduleId: DummyModuleId,
	overrides?: Partial<Module>,
	suitesAndTests?: Array<Suite | Test>,
): Module {
	return newModule({
		id: moduleId,
		duration: 0,
		path: getDummyModulePath(moduleId),
		status: "passed",
		suitesAndTests: suitesAndTests ?? [],
		...overrides,
	})
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
	overrides?: Partial<{
		duration: Duration
		status: TestModuleState
	}>,
): TestModule {
	return {
		type: "module",
		diagnostic: () => ({ duration: overrides?.duration ?? 0 }),
		id: moduleId,
		moduleId: getDummyModulePath(moduleId),
		state: () => overrides?.status ?? "pending",
	} as TestModule
}

export type DummyModuleId =
	| "15b021ef72"
	| "a3fdd8b6c3"
	| "-1730f876b4"
	| "-e45b128829"

const dummyPathsById: Record<DummyModuleId, Path> = {
	"15b021ef72":
		"/Users/sdi/repositories/plantation/src/orchard/Apples.tests.ts",
	a3fdd8b6c3:
		"/Users/sdi/repositories/plantation/src/shipping/Bananas.tests.ts",
	"-1730f876b4":
		"/Users/sdi/repositories/plantation/src/basket/Oranges.tests.ts",
	"-e45b128829":
		"/Users/sdi/repositories/plantation/src/supermarket/Peaches.tests.ts",
}

export function getDummyModulePath(moduleId: DummyModuleId): Path {
	return dummyPathsById[moduleId]
}
