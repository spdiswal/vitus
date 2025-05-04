import type { Module } from "+api/models/Module"
import type { ModuleId } from "+api/models/ModuleId"
import type { Project } from "+api/models/Project"
import type { Subtask } from "+api/models/Subtask"
import type { SubtaskId } from "+api/models/SubtaskId"
import { computeProjectStatus } from "+api/models/TaskStatus"
import { newModuleFromVitest } from "+server/models/VitestModule"
import { newSuiteFromVitest } from "+server/models/VitestSuite"
import { newTestFromVitest } from "+server/models/VitestTest"
import type { Vitest } from "vitest/node"

export function newProjectFromVitest(vitest: Vitest): Project {
	const modulesById: Record<ModuleId, Module> = {}
	const subtasksById: Record<SubtaskId, Subtask> = {}

	for (const module of vitest.state.getTestModules()) {
		modulesById[module.id] = newModuleFromVitest(module)

		for (const suite of module.children.allSuites()) {
			subtasksById[suite.id] = newSuiteFromVitest(suite)
		}
		for (const test of module.children.allTests()) {
			subtasksById[test.id] = newTestFromVitest(test)
		}
	}

	return {
		rootPath: vitest.config.root,
		isConnected: true,
		status: computeProjectStatus(modulesById),
		modulesById,
		subtasksById,
	}
}
