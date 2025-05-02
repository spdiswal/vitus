import type { Module, Modules } from "+api/models/Module"
import type { ModuleId } from "+api/models/ModuleId"
import type { Subtask } from "+api/models/Subtask"
import type { SubtaskId } from "+api/models/SubtaskId"
import type { TaskStatus } from "+api/models/TaskStatus"
import type { Path } from "+types/Path"

export type Project = {
	rootPath: Path
	isConnected: boolean
	status: TaskStatus
	modulesById: Readonly<Record<ModuleId, Module>>
	subtasksById: Readonly<Record<SubtaskId, Subtask>> // Suites and tests use a shared id namespace in Vitest (i.e. it is impossible to determine from an id alone whether it is a suite or test).
}

export function newProject(project: Project): Project {
	const modules = Object.values(project.modulesById)
	const status = getProjectStatusFromModules(modules)

	return status !== project.status ? { ...project, status } : project
}

function getProjectStatusFromModules(modules: Modules): TaskStatus {
	const statuses = new Set<TaskStatus>()

	for (const module of modules) {
		if (module.status === "started") {
			return "started"
		}
		statuses.add(module.status)
	}

	if (statuses.has("failed")) {
		return "failed"
	}
	if (statuses.has("passed")) {
		return "passed"
	}
	return "skipped"
}
