import { type Project, newProject } from "+models/Project"
import type { TaskId, TaskIds } from "+models/TaskId"
import type { TaskStatus } from "+models/TaskStatus"
import { type Path, getFilenameFromPath } from "+types/Path"
import { assertNotNullish } from "+utilities/Assertions"
import type { TestModule } from "vitest/node"

export type Module = {
	type: "module"
	id: TaskId
	path: Path
	filename: string
	status: TaskStatus
}

export type Modules = Array<Module>

export function hasModule(project: Project, moduleId: TaskId): boolean {
	return moduleId in project.modulesById
}

export function getModuleById(project: Project, moduleId: TaskId): Module {
	const module = project.modulesById[moduleId]
	assertNotNullish(module, "module")

	return module
}

export function getModulesByIds(project: Project, moduleIds: TaskIds): Modules {
	return moduleIds.map((moduleId) => getModuleById(project, moduleId))
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

export function mapVitestToModule(module: TestModule): Module {
	const status = module.state()
	return {
		type: "module",
		id: module.id,
		path: module.moduleId,
		filename: getFilenameFromPath(module.moduleId),
		status: status === "queued" || status === "pending" ? "started" : status,
	}
}
