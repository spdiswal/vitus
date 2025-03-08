import { type File, newFile } from "+models/File"
import type { Suite } from "+models/Suite"
import type { Test } from "+models/Test"
import type { Duration } from "+types/Duration"
import type { Path } from "+types/Path"
import type {
	TestModule,
	TestModuleState,
	TestSpecification,
} from "vitest/node"

export function dummyFile(
	fileId: DummyFileId,
	overrides?: Partial<File>,
	suitesAndTests?: Array<Suite | Test>,
): File {
	return newFile({
		id: fileId,
		duration: 0,
		path: getDummyFilePath(fileId),
		status: "passed",
		suitesAndTests: suitesAndTests ?? [],
		...overrides,
	})
}

export function dummyVitestSpecification(
	fileId: DummyFileId,
): TestSpecification {
	return {
		moduleId: dummyPathsById[fileId],
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
		diagnostic: () => ({ duration: overrides?.duration ?? 0 }),
		id: fileId,
		moduleId: getDummyFilePath(fileId),
		state: () => overrides?.status ?? "pending",
	} as TestModule
}

export type DummyFileId =
	| "15b021ef72"
	| "a3fdd8b6c3"
	| "-1730f876b4"
	| "-e45b128829"

const dummyPathsById: Record<DummyFileId, Path> = {
	"15b021ef72":
		"/Users/sdi/repositories/plantation/src/orchard/Apples.tests.ts",
	a3fdd8b6c3:
		"/Users/sdi/repositories/plantation/src/shipping/Bananas.tests.ts",
	"-1730f876b4":
		"/Users/sdi/repositories/plantation/src/basket/Oranges.tests.ts",
	"-e45b128829":
		"/Users/sdi/repositories/plantation/src/supermarket/Peaches.tests.ts",
}

export function getDummyFilePath(fileId: DummyFileId): Path {
	return dummyPathsById[fileId]
}
