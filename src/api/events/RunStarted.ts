import type { Module } from "+api/models/Module"
import { type Project, newProject } from "+api/models/Project"
import type { Subtask } from "+api/models/Subtask"
import type { TaskId, TaskIds } from "+api/models/TaskId"

export type RunStarted = {
	type: "run-started"
	invalidatedModuleIds: TaskIds
}

export function runStarted(invalidatedModuleIds: TaskIds): RunStarted {
	return { type: "run-started", invalidatedModuleIds }
}

export function applyRunStarted(project: Project, event: RunStarted): Project {
	const modulesById: Record<TaskId, Module> = Object.fromEntries(
		Object.entries(project.modulesById).map(([moduleId, module]) => [
			moduleId,
			event.invalidatedModuleIds.includes(module.id)
				? { ...module, status: "started" }
				: module,
		]),
	)

	const subtasksById: Record<TaskId, Subtask> = Object.fromEntries(
		Object.entries(project.subtasksById).map(([subtaskId, subtask]) => [
			subtaskId,
			event.invalidatedModuleIds.includes(subtask.parentModuleId)
				? { ...subtask, status: "started" }
				: subtask,
		]),
	)

	return newProject({ ...project, modulesById, subtasksById })
}
