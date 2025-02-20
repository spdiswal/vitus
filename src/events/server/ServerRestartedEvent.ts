import { type Project, newProject } from "+models/Project"

export type ServerRestartedEvent = {
	type: "server-restarted"
}

export function serverRestartedEvent(): ServerRestartedEvent {
	return { type: "server-restarted" }
}

export function applyServerRestartedEvent(project: Project): Project {
	return newProject({ ...project, files: [], isConnected: true })
}
