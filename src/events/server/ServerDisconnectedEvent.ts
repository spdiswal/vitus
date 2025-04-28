import { removeModulesByStatus } from "+models/Module"
import type { Project } from "+models/Project"
import { removeSubtasksByStatus } from "+models/Subtask"
import { logDebug } from "+utilities/Logging"

export type ServerDisconnectedEvent = {
	type: "server-disconnected"
}

export function serverDisconnectedEvent(): ServerDisconnectedEvent {
	return { type: "server-disconnected" }
}

export function applyServerDisconnectedEvent(project: Project): Project {
	return {
		...removeModulesByStatus(
			removeSubtasksByStatus(project, "running"),
			"running",
		),
		isConnected: false,
	}
}

export function logServerDisconnectedEvent(
	event: ServerDisconnectedEvent,
): void {
	logDebug(
		{
			label: "Server disconnected",
			labelColour: "#a21caf",
			message: "",
		},
		{ event },
	)
}
