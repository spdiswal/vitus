import {
	dropUnfinishedModuleChildren,
	hasNotModuleStatus,
} from "+models/Module"
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
		modules: project.modules
			.filter(hasNotModuleStatus("running"))
			.map(dropUnfinishedModuleChildren),
		isConnected: false,
	})
}

export function logServerDisconnectedEvent(
	project: Project,
	event: ServerDisconnectedEvent,
): void {
	const { modules, ...loggableProject } = project

	logDebug(
		{
			label: "Server disconnected",
			labelColour: "#a21caf",
			message: `Project ${project.status}`,
		},
		{ event, project: loggableProject },
	)
}
