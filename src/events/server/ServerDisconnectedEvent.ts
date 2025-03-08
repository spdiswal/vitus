import { dropUnfinishedFileChildren, hasNotFileStatus } from "+models/File"
import { type Project, newProject } from "+models/Project"
import { logDebug } from "+utilities/Logging"

export type ServerDisconnectedEvent = {
	type: "server-disconnected"
}

export function serverDisconnectedEvent(): ServerDisconnectedEvent {
	return { type: "server-disconnected" }
}

export function applyServerDisconnectedEvent(project: Project): Project {
	return newProject({
		...project,
		files: project.files
			.filter(hasNotFileStatus("running"))
			.map(dropUnfinishedFileChildren),
		isConnected: false,
	})
}

export function logServerDisconnectedEvent(
	project: Project,
	event: ServerDisconnectedEvent,
): void {
	const { files, ...loggableProject } = project

	logDebug(
		{
			label: "Server disconnected",
			labelColour: "#a21caf",
			message: `Project ${project.status}`,
		},
		{ event, project: loggableProject },
	)
}
