import { getModules } from "+api/models/Module"
import type { Project } from "+api/models/Project"
import { getSubtasks } from "+api/models/Subtask"
import { removeTasks } from "+api/models/Task"
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

	return removeTasks(
		{ ...project, isConnected: false },
		unfinishedModules,
		unfinishedSubtasks,
	)
}
