import { type File, newFile } from "+models/File"
import type { Suite } from "+models/Suite"
import type { Test } from "+models/Test"
import type { Path } from "+types/Path"
import type {
	TestModule,
	TestModuleState,
	TestSpecification,
} from "vitest/node"

export type DummyFileId =
	| "15b021ef72"
	| "a3fdd8b6c3"
	| "-1730f876b4"
	| "-e45b128829"

const dummyFilenamesById: Record<DummyFileId, string> = {
	"15b021ef72": "Apples.tests.ts",
	a3fdd8b6c3: "Bananas.tests.ts",
	"-1730f876b4": "Oranges.tests.ts",
	"-e45b128829": "Peaches.tests.ts",
}

export function dummyFile(
	fileId: DummyFileId,
	overrides?: Partial<File>,
	children?: Array<Suite | Test>,
): File {
	return newFile({
		id: fileId,
		duration: 0,
		path: `/Users/sdi/repositories/plantation/src/basket/${dummyFilenamesById[fileId]}`,
		status: "passed",
		children: children ?? [],
		...overrides,
	})
}

export function fakeVitestSpecification(props: {
	filePath: Path
}): TestSpecification {
	return { moduleId: props.filePath } as TestSpecification
}

export function fakeVitestModule(props: {
	filePath: Path
	status: TestModuleState
}): TestModule {
	return {
		type: "module",
		moduleId: props.filePath,
		state: () => props.status,
	} as TestModule
}
