import type { ModuleId } from "+api/models/ModuleId"
import type { Project } from "+api/models/Project"
import type { TaskId } from "+api/models/TaskId"
import { type TaskStatus, skipped, started } from "+api/models/TaskStatus"
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

export function getModules(
	project: Project,
	predicate?: (module: Module) => boolean,
): Modules {
	const modules = Object.values(project.modulesById)
	return predicate !== undefined ? modules.filter(predicate) : modules
}

export function hasModule(
	project: Project,
	taskId: TaskId,
): taskId is ModuleId {
	return taskId in project.modulesById
}

export function getModuleById(project: Project, moduleId: ModuleId): Module {
	const module = project.modulesById[moduleId]
	assertNotNullish(module, "module")

	return module
}

export function putModule(project: Project, module: Module): Project {
	return {
		...project,
		modulesById: { ...project.modulesById, [module.id]: module },
	}
}

export function skipModule(module: Module): Module {
	return { ...module, status: skipped() }
}

export function startModule(module: Module): Module {
	return { ...module, status: started() }
}
