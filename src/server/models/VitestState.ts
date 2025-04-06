import type { ModuleDto } from "+api/models/ModuleDto"
import type { StateDto } from "+api/models/StateDto"
import type { SubtaskDto } from "+api/models/SubtaskDto"
import { getRootStatus } from "+explorer/models/RootStatus"
import {
	type VitestModule,
	vitestModuleToDto,
} from "+server/models/VitestModule"
import { vitestSuiteToDto } from "+server/models/VitestSuite"
import { vitestTestToDto } from "+server/models/VitestTest"
import type { TaskStatus } from "+types/TaskStatus"
import type { Vitest } from "vitest/node"

/**
 * A subset of {@link Vitest} that is easier to mock in unit tests.
 */
export type VitestState = Pick<Vitest, "config" | "state">

export function vitestStateToDto(state: VitestState): StateDto {
	const vitestModules: Iterable<VitestModule> = state.state.getTestModules()

	const modules: Array<ModuleDto> = []
	const subtasks: Array<SubtaskDto> = []

	const moduleStatuses = new Set<TaskStatus>()

	for (const vitestModule of vitestModules) {
		const module = vitestModuleToDto(vitestModule)

		modules.push(module)
		moduleStatuses.add(module.status)

		for (const suite of vitestModule.children.allSuites()) {
			subtasks.push(vitestSuiteToDto(suite))
		}
		for (const test of vitestModule.children.allTests()) {
			subtasks.push(vitestTestToDto(test))
		}
	}

	return {
		rootPath: state.config.root,
		rootStatus: getRootStatus(moduleStatuses),
		modules: modules,
		subtasks,
	}
}
