import type { Project } from "+api/models/Project"

export type ServerRestarted = {
	type: "server-restarted"
}

export function serverRestarted(): ServerRestarted {
	return { type: "server-restarted" }
}

export function applyServerRestarted(project: Project): Project {
	return {
		rootPath: project.rootPath,
		status: "started",
		modulesById: {},
		subtasksById: {},
	}
}
