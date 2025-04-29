import type { Module } from "+models/Module"
import { type Project, newProject } from "+models/Project"
import type { Subtask } from "+models/Subtask"
import type { TaskId, TaskIds } from "+models/TaskId"
import { logDebug } from "+utilities/Logging"

export type RunStartedEvent = {
	type: "run-started"
	invalidatedModuleIds: TaskIds
}

export function runStartedEvent(
	invalidatedModuleIds: TaskIds,
): RunStartedEvent {
	return { type: "run-started", invalidatedModuleIds }
}

export function applyRunStartedEvent(
	project: Project,
	event: RunStartedEvent,
): Project {
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

export function logRunStartedEvent(event: RunStartedEvent): void {
	logDebug(
		{
			label: "run started",
			labelColour: "#1d4ed8",
			message: "",
		},
		{ event },
	)
}
