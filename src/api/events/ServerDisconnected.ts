import { getModules, skipModule } from "+api/models/Module"
import type { Project } from "+api/models/Project"
import { getSubtasks, skipSubtask } from "+api/models/Subtask"
import { putTasks } from "+api/models/Task"
import { byStatus } from "+api/models/TaskStatus"

export type ServerDisconnected = {
	type: "server-disconnected"
}

export function serverDisconnected(): ServerDisconnected {
	return { type: "server-disconnected" }
}

export function applyServerDisconnected(project: Project): Project {
	const unfinishedModules = getModules(project, byStatus("started"))
	const unfinishedSubtasks = getSubtasks(project, byStatus("started"))

	return putTasks(
		{ ...project, status: "disconnected" },
		unfinishedModules.map(skipModule),
		unfinishedSubtasks.map(skipSubtask),
	)
}
