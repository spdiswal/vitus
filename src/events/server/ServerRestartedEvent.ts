import type { Project } from "+models/Project"
import { logDebug } from "+utilities/Logging"

export type ServerRestartedEvent = {
	type: "server-restarted"
}

export function serverRestartedEvent(): ServerRestartedEvent {
	return { type: "server-restarted" }
}

export function applyServerRestartedEvent(project: Project): Project {
	return {
		rootPath: project.rootPath,
		isConnected: true,
		status: "passed",
		modulesById: {},
		subtasksById: {},
	}
}

export function logServerRestartedEvent(event: ServerRestartedEvent): void {
	logDebug(
		{
			label: "Server restarted",
			labelColour: "#a21caf",
			message: "",
		},
		{ event },
	)
}
