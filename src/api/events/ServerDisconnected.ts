import { removeModulesByStatus } from "+api/models/Module"
import type { Project } from "+api/models/Project"
import { removeSubtasksByStatus } from "+api/models/Subtask"

export type ServerDisconnected = {
	type: "server-disconnected"
}

export function serverDisconnected(): ServerDisconnected {
	return { type: "server-disconnected" }
}

export function applyServerDisconnected(project: Project): Project {
	return {
		...removeModulesByStatus(
			removeSubtasksByStatus(project, "started"),
			"started",
		),
		isConnected: false,
	}
}
