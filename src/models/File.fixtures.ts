import { type File, type FileId, newFile } from "+models/File"
import type { Path } from "+types/Path"
import type {
	TestModule,
	TestModuleState,
	TestSpecification,
} from "vitest/node"

export function dummyFile(
	id: keyof typeof dummyFiles,
	overrides?: Partial<File>,
): File {
	return newFile({ ...dummyFiles[id], ...overrides })
}

const dummyFiles = {
	"15b021ef72": newFile({
		id: "15b021ef72",
		duration: 0,
		path: "/Users/sdi/repositories/plantation/src/basket/Apples.tests.ts",
		status: "passed",
		suites: [],
		tests: [],
	}),
	a3fdd8b6c3: newFile({
		id: "a3fdd8b6c3",
		duration: 0,
		path: "/Users/sdi/repositories/plantation/src/basket/Bananas.tests.ts",
		status: "passed",
		suites: [],
		tests: [],
	}),
	"-1730f876b4": newFile({
		id: "-1730f876b4",
		duration: 0,
		path: "/Users/sdi/repositories/plantation/src/basket/Oranges.tests.ts",
		status: "passed",
		suites: [],
		tests: [],
	}),
	"-e45b128829": newFile({
		id: "-e45b128829",
		duration: 0,
		path: "/Users/sdi/repositories/plantation/src/basket/Peaches.tests.ts",
		status: "passed",
		suites: [],
		tests: [],
	}),
} as const satisfies Record<FileId, File>

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
