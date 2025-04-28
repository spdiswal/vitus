import { type Project, newProject } from "+models/Project"
import type { TaskId } from "+models/TaskId"
import type { TaskStatus } from "+models/TaskStatus"
import { type Path, getFilenameFromPath } from "+types/Path"
import type { TestModule } from "vitest/node"

export type Module = {
	type: "module"
	id: TaskId
	path: Path
	filename: string
	status: TaskStatus
}

export type Modules = Array<Module>

export function getModuleById(project: Project, id: TaskId): Module | null {
	return project.modulesById[id] ?? null
}

export function isExistingModule(project: Project, module: Module): boolean {
	return module.id in project.modulesById
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
