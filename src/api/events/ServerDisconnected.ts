import { getModules } from "+api/models/Module"
import type { Project } from "+api/models/Project"
import { getSubtasks } from "+api/models/Subtask"
import { putTasks, skipTask } from "+api/models/Task"
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
		{ ...project, isConnected: false },
		unfinishedModules.map(skipTask),
		unfinishedSubtasks.map(skipTask),
	)
}
