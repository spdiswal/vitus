import type { Module } from "+api/models/Module"
import type { ModuleId, ModuleIds } from "+api/models/ModuleId"
import { type Project, newProject } from "+api/models/Project"
import type { Subtask } from "+api/models/Subtask"
import type { SubtaskId } from "+api/models/SubtaskId"

export type RunStarted = {
	type: "run-started"
	invalidatedIds: ModuleIds
}

export function runStarted(invalidatedIds: ModuleIds): RunStarted {
	return { type: "run-started", invalidatedIds }
}

export function applyRunStarted(project: Project, event: RunStarted): Project {
	const modulesById: Record<ModuleId, Module> = Object.fromEntries(
		Object.entries(project.modulesById).map(([moduleId, module]) => [
			moduleId,
			event.invalidatedIds.includes(module.id)
				? { ...module, status: "started" }
				: module,
		]),
	)

	const subtasksById: Record<SubtaskId, Subtask> = Object.fromEntries(
		Object.entries(project.subtasksById).map(([subtaskId, subtask]) => [
			subtaskId,
			event.invalidatedIds.includes(subtask.parentModuleId)
				? { ...subtask, status: "started" }
				: subtask,
		]),
	)

	return newProject({ ...project, modulesById, subtasksById })
}
