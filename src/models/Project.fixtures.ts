import type { Modules } from "+models/Module"
import type { DummyModuleId } from "+models/Module.fixtures"
import { type Project, newProject } from "+models/Project"
import type { DummySuiteId } from "+models/Suite.fixtures"
import type { DummyTestId } from "+models/Test.fixtures"

export type DummyIds = Array<DummyModuleId | DummySuiteId | DummyTestId>

export function dummyProject(
	overrides?: Partial<Project>,
	modules?: Modules,
): Project {
	return newProject({
		isConnected: true,
		rootPath: "/Users/sdi/repositories/plantations/",
		modules: modules ?? [],
		...overrides,
	})
}
