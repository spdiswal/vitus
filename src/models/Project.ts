import { type Module, type Modules, mapVitestToModule } from "+models/Module"
import { type Suite, mapVitestToSuite } from "+models/Suite"
import type { TaskId } from "+models/TaskId"
import type { TaskStatus } from "+models/TaskStatus"
import { type Test, mapVitestToTest } from "+models/Test"
import type { Path } from "+types/Path"
import type { Vitest } from "vitest/node"

export type Project = {
	rootPath: Path
	isConnected: boolean
	status: TaskStatus
	modulesById: Record<TaskId, Module>
	subtasksById: Record<TaskId, Suite | Test> // Suites and tests use a shared id namespace in Vitest (i.e. it is impossible to determine from an id alone whether it is a suite or test).
}

export function newProject(project: Project): Project {
	const remainingSubtasksById = Object.fromEntries(
		Object.entries(project.subtasksById).filter(
			([, subtask]) =>
				subtask.parentModuleId in project.modulesById &&
				(subtask.parentId in project.modulesById ||
					subtask.parentId in project.subtasksById),
		),
	)

	return {
		...project,
		status: getProjectStatus(Object.values(project.modulesById)),
		subtasksById: remainingSubtasksById,
	}
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
		status: getProjectStatus(Object.values(modulesById)),
		modulesById,
		subtasksById,
	})
}

function getProjectStatus(modules: Modules): TaskStatus {
	return modules.some((module) => module.status === "started")
		? "started"
		: modules.some((module) => module.status === "failed")
			? "failed"
			: modules.some((module) => module.status === "passed")
				? "passed"
				: "skipped"
}
