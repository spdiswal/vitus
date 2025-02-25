import { newFile } from "+models/File"
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
		files: project.files
			.filter((file) => file.status !== "running")
			.map((file) =>
				newFile({
					...file,
					suites: file.suites.filter((suite) => suite.status !== "running"),
					tests: file.tests.filter((test) => test.status !== "running"),
				}),
			),
		isConnected: false,
	})
}
