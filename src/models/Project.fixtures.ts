import type { Files } from "+models/File"
import type { DummyFileId } from "+models/File.fixtures"
import { type Project, newProject } from "+models/Project"
import type { DummySuiteId } from "+models/Suite.fixtures"
import type { DummyTestId } from "+models/Test.fixtures"

export type DummyIds = Array<DummyFileId | DummySuiteId | DummyTestId>

export function dummyProject(
	overrides?: Partial<Project>,
	files?: Files,
): Project {
	return newProject({
		isConnected: true,
		rootPath: "/Users/sdi/repositories/plantations/",
		files: files ?? [],
		...overrides,
	})
}
