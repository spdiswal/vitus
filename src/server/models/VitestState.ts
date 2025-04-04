import type { FileDto } from "+api/models/FileDto"
import type { InitialStateDto } from "+api/models/InitialStateDto"
import type { SubtaskDto } from "+api/models/SubtaskDto"
import { getRootStatus } from "+explorer/models/RootStatus"
import { vitestModuleToDto } from "+server/models/VitestModule"
import { vitestSuiteToDto } from "+server/models/VitestSuite"
import { vitestTestToDto } from "+server/models/VitestTest"
import type { TaskStatus } from "+types/TaskStatus"
import type { Vitest } from "vitest/node"

/**
 * A subset of {@link Vitest} that is easier to mock in unit tests.
 */
export type VitestState = Pick<Vitest, "config" | "state">

export function vitestStateToDto(state: VitestState): InitialStateDto {
	const modules = state.state.getTestModules()

	const files: Array<FileDto> = []
	const subtasks: Array<SubtaskDto> = []

	const fileStatuses = new Set<TaskStatus>()

	for (const module of modules) {
		const file = vitestModuleToDto(module)

		files.push(file)
		fileStatuses.add(file.status)

		for (const suite of module.children.allSuites()) {
			subtasks.push(vitestSuiteToDto(suite))
		}
		for (const test of module.children.allTests()) {
			subtasks.push(vitestTestToDto(test))
		}
	}

	return {
		rootPath: state.config.root,
		rootStatus: getRootStatus(fileStatuses),
		files,
		subtasks,
	}
}
