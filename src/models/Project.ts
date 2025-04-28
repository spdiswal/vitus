import { type Module, mapVitestToModule } from "+models/Module"
import { type Suite, mapVitestToSuite } from "+models/Suite"
import type { TaskId } from "+models/TaskId"
import { type Test, mapVitestToTest } from "+models/Test"
import type { Path } from "+types/Path"
import type { Vitest } from "vitest/node"

export type Project = {
	rootPath: Path
	isConnected: boolean
	status: ProjectStatus
	modulesById: Record<TaskId, Module>
	subtasksById: Record<TaskId, Suite | Test> // Suites and tests use a shared id namespace in Vitest (i.e. it is impossible to determine from an id alone whether it is a suite or test).
}

export type ProjectStatus = "failed" | "passed" | "started"

export function newProject(project: Project): Project {
	const modules = Object.values(project.modulesById)

	const status = modules.some((module) => module.status === "started")
		? "started"
		: modules.some((module) => module.status === "failed")
			? "failed"
			: "passed"

	const remainingSubtasksById = Object.fromEntries(
		Object.entries(project.subtasksById).filter(
			([, subtask]) =>
				subtask.parentModuleId in project.modulesById &&
				(subtask.parentId in project.modulesById ||
					subtask.parentId in project.subtasksById),
		),
	)

	return { ...project, status, subtasksById: remainingSubtasksById }
}

export function mapVitestToProject(vitest: Vitest): Project {
	const modulesById: Record<TaskId, Module> = {}
	const subtasksById: Record<TaskId, Suite | Test> = {}

	for (const module of vitest.state.getTestModules()) {
		modulesById[module.id] = mapVitestToModule(module)

		for (const suite of module.children.allSuites()) {
			subtasksById[suite.id] = mapVitestToSuite(suite)
		}
		for (const test of module.children.allTests()) {
			subtasksById[test.id] = mapVitestToTest(test)
		}
	}

	return newProject({
		rootPath: vitest.config.root,
		isConnected: true,
		status: "started",
		modulesById,
		subtasksById,
	})
}
