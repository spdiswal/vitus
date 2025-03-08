import { type Project, newProject } from "+models/Project"
import { logDebug } from "+utilities/Logging"

export type ServerRestartedEvent = {
	type: "server-restarted"
}

export function serverRestartedEvent(): ServerRestartedEvent {
	return { type: "server-restarted" }
}

export function applyServerRestartedEvent(project: Project): Project {
	return newProject({ ...project, files: [], isConnected: true })
}

export function logServerRestartedEvent(
	project: Project,
	event: ServerRestartedEvent,
): void {
	const { files, ...loggableProject } = project

	logDebug(
		{
			label: "Server restarted",
			labelColour: "#a21caf",
			message: `Project ${project.status}`,
		},
		{ event, project: loggableProject },
	)
}
