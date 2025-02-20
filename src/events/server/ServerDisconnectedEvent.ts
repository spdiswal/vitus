import { type Project, newProject } from "+models/Project"

export type ServerDisconnectedEvent = {
	type: "server-disconnected"
}

export function serverDisconnectedEvent(): ServerDisconnectedEvent {
	return { type: "server-disconnected" }
}

export function applyServerDisconnectedEvent(project: Project): Project {
	return newProject({
		...project,
		files: project.files.filter((file) => file.status !== "running"),
		isConnected: false,
	})
}
