import { type Project, newProject } from "+models/Project"

export function dummyProject(overrides?: Partial<Project>): Project {
	return newProject({
		isConnected: true,
		files: [],
		rootPath: "/Users/sdi/repositories/plantations/",
		...overrides,
	})
}
