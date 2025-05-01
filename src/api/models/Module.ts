import type { ModuleId, ModuleIds } from "+api/models/ModuleId"
import { type Project, newProject } from "+api/models/Project"
import type { TaskId } from "+api/models/TaskId"
import type { TaskStatus } from "+api/models/TaskStatus"
import type { Path } from "+types/Path"
import { assertNotNullish } from "+utilities/Assertions"

export type Module = {
	type: "module"
	id: ModuleId
	path: Path
	filename: string
	status: TaskStatus
}
export type Modules = Array<Module>

export function hasModule(project: Project, id: TaskId): id is ModuleId {
	return id in project.modulesById
}

export function getModuleById(project: Project, id: ModuleId): Module {
	const module = project.modulesById[id]
	assertNotNullish(module, "module")

	return module
}

export function getModulesByIds(project: Project, ids: ModuleIds): Modules {
	return ids.map((moduleId) => getModuleById(project, moduleId))
}

export function putModule(project: Project, module: Module): Project {
	return newProject({
		...project,
		modulesById: { ...project.modulesById, [module.id]: module },
	})
}

export function removeModulesByPath(project: Project, path: Path): Project {
	const remainingModulesById = Object.fromEntries(
		Object.entries(project.modulesById).filter(
			([, module]) => module.path !== path,
		),
	)

	return newProject({ ...project, modulesById: remainingModulesById })
}

export function removeModulesByStatus(
	project: Project,
	status: TaskStatus,
): Project {
	const remainingModulesById = Object.fromEntries(
		Object.entries(project.modulesById).filter(
			([, module]) => module.status !== status,
		),
	)

	return newProject({ ...project, modulesById: remainingModulesById })
}
