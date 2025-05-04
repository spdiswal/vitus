import { type Module, putModule } from "+api/models/Module"
import { byParentModuleId } from "+api/models/ModuleId"
import type { Project } from "+api/models/Project"
import { getSubtasks } from "+api/models/Subtask"
import { removeTasks } from "+api/models/Task"
import { byStatus } from "+api/models/TaskStatus"

export type ModuleUpdated = {
	type: "module-updated"
	module: Module
}

export function moduleUpdated(module: Module): ModuleUpdated {
	return { type: "module-updated", module }
}

export function applyModuleUpdated(
	project: Project,
	event: ModuleUpdated,
): Project {
	const updatedProject = putModule(project, event.module)

	if (event.module.status === "started") {
		return updatedProject
	}

	const unfinishedChildSubtasks = getSubtasks(
		project,
		byParentModuleId(event.module.id),
	).filter(byStatus("started"))

	return removeTasks(updatedProject, [], unfinishedChildSubtasks)
}
