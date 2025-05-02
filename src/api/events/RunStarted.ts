import { getModules } from "+api/models/Module"
import {
	type ModuleIds,
	byModuleIds,
	byParentModuleIds,
} from "+api/models/ModuleId"
import type { Project } from "+api/models/Project"
import { getSubtasks } from "+api/models/Subtask"
import { putTasks, startTask } from "+api/models/Task"

export type RunStarted = {
	type: "run-started"
	invalidatedModuleIds: ModuleIds
}

export function runStarted(invalidatedModuleIds: ModuleIds): RunStarted {
	return { type: "run-started", invalidatedModuleIds }
}

export function applyRunStarted(project: Project, event: RunStarted): Project {
	const moduleIds = event.invalidatedModuleIds
	const invalidatedModules = getModules(project, byModuleIds(moduleIds))
	const invalidatedSubtasks = getSubtasks(project, byParentModuleIds(moduleIds))

	return putTasks(
		project,
		invalidatedModules.map(startTask),
		invalidatedSubtasks.map(startTask),
	)
}
