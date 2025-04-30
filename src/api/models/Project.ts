import type { Module } from "+api/models/Module"
import type { Subtask } from "+api/models/Subtask"
import type { TaskId } from "+api/models/TaskId"
import type { TaskStatus } from "+api/models/TaskStatus"
import type { Path } from "+types/Path"

export type Project = {
	rootPath: Path
	isConnected: boolean
	status: TaskStatus
	modulesById: Record<TaskId, Module>
	subtasksById: Record<TaskId, Subtask> // Suites and tests use a shared id namespace in Vitest (i.e. it is impossible to determine from an id alone whether it is a suite or test).
}

export function newProject(project: Omit<Project, "status">): Project {
	const modules = Object.values(project.modulesById)
	const status = modules.some((module) => module.status === "started")
		? "started"
		: modules.some((module) => module.status === "failed")
			? "failed"
			: modules.some((module) => module.status === "passed")
				? "passed"
				: "skipped"

	const remainingSubtasksById = Object.fromEntries(
		Object.entries(project.subtasksById).filter(
			([, subtask]) =>
				subtask.parentModuleId in project.modulesById &&
				(subtask.parentId in project.modulesById ||
					subtask.parentId in project.subtasksById),
		),
	)

	return { ...project, status, subtasksById: remainingSubtasksById }
}
