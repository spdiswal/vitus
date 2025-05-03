import type { Module, Modules } from "+api/models/Module"
import type { ModuleId } from "+api/models/ModuleId"
import { type Project, newProject } from "+api/models/Project"
import { type Subtask, type Subtasks, getSubtasks } from "+api/models/Subtask"
import type { SubtaskId } from "+api/models/SubtaskId"
import { type TaskIds, byParentIds } from "+api/models/TaskId"

export type Task = Module | Subtask

export function skipTask<TaskToUpdate extends Task>(
	task: TaskToUpdate,
): TaskToUpdate {
	return { ...task, status: "skipped" }
}

export function startTask<TaskToUpdate extends Task>(
	task: TaskToUpdate,
): TaskToUpdate {
	return { ...task, status: "started" }
}

/**
 * Stores the given modules and subtasks in the project in a memory-efficient manner.
 */
export function putTasks(
	project: Project,
	modules: Modules,
	subtasks: Subtasks,
): Project {
	let modulesById: Record<ModuleId, Module> = project.modulesById

	for (const module of modules) {
		if (modulesById === project.modulesById) {
			modulesById = { ...project.modulesById }
		}
		modulesById[module.id] = module
	}

	let subtasksById: Record<SubtaskId, Subtask> = project.subtasksById

	for (const subtask of subtasks) {
		if (subtasksById === project.subtasksById) {
			subtasksById = { ...project.subtasksById }
		}
		subtasksById[subtask.id] = subtask
	}

	if (
		modulesById !== project.modulesById ||
		subtasksById !== project.subtasksById
	) {
		return newProject({ ...project, modulesById, subtasksById })
	}

	return project
}

/**
 * Removes the given modules and subtasks from the project in a memory-efficient manner.
 */
export function removeTasks(
	project: Project,
	modules: Modules,
	subtasks: Subtasks,
): Project {
	if (modules.length === 0 && subtasks.length === 0) {
		return project
	}

	const modulesById = { ...project.modulesById }
	const subtasksById = { ...project.subtasksById }

	const descendants = getDescendants(project, [
		...modules.map((module) => module.id),
		...subtasks.map((subtask) => subtask.id),
	])

	for (const module of modules) {
		delete modulesById[module.id]
	}
	for (const subtask of subtasks) {
		delete subtasksById[subtask.id]
	}
	for (const descendant of descendants) {
		delete subtasksById[descendant.id]
	}

	return newProject({ ...project, modulesById, subtasksById })
}

function getDescendants(project: Project, taskIds: TaskIds): Subtasks {
	return getSubtasks(project, byParentIds(taskIds)).flatMap((subtask) =>
		subtask.type === "test"
			? [subtask]
			: [subtask, ...getDescendants(project, [subtask.id])],
	)
}
