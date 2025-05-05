import { getModules } from "+api/models/Module"
import type { Project } from "+api/models/Project"
import { computeProjectStatus } from "+api/models/ProjectStatus"
import { removeTasks } from "+api/models/Task"
import { type Path, byPath } from "+types/Path"

export type ModuleDeleted = {
	type: "module-deleted"
	path: Path
}

export function moduleDeleted(path: Path): ModuleDeleted {
	return { type: "module-deleted", path }
}

export function applyModuleDeleted(
	project: Project,
	event: ModuleDeleted,
): Project {
	const deletedModules = getModules(project, byPath(event.path))

	const updatedProject = removeTasks(project, deletedModules, [])
	const projectStatus = computeProjectStatus(updatedProject.modulesById)

	if (projectStatus !== updatedProject.status) {
		return { ...updatedProject, status: projectStatus }
	}
	return updatedProject
}
