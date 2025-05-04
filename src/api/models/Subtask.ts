import type { Project } from "+api/models/Project"
import type { SubtaskId } from "+api/models/SubtaskId"
import type { Suite } from "+api/models/Suite"
import type { TaskId } from "+api/models/TaskId"
import type { TaskStatus, TaskStatuses } from "+api/models/TaskStatus"
import type { Test } from "+api/models/Test"
import { assertNotNullish } from "+utilities/Assertions"

export type Subtask = Suite | Test
export type Subtasks = Array<Subtask>

export function getSubtasks(
	project: Project,
	predicate?: (subtask: Subtask) => boolean,
): Subtasks {
	const subtasks = Object.values(project.subtasksById)
	return predicate !== undefined ? subtasks.filter(predicate) : subtasks
}

export function getSubtaskStatuses(
	project: Project,
	predicate?: (subtask: Subtask) => boolean,
): TaskStatuses {
	const statuses = new Set<TaskStatus>()

	for (const subtask of getSubtasks(project, predicate)) {
		statuses.add(subtask.status)
	}

	return Array.from(statuses)
}

export function hasSubtask(
	project: Project,
	taskId: TaskId,
): taskId is SubtaskId {
	return taskId in project.subtasksById
}

export function getSubtaskById(
	project: Project,
	subtaskId: SubtaskId,
): Subtask {
	const subtask = project.subtasksById[subtaskId]
	assertNotNullish(subtask, "subtask")

	return subtask
}

export function putSubtask(project: Project, subtask: Subtask): Project {
	const hasExistingParents =
		subtask.parentModuleId in project.modulesById &&
		(subtask.parentId in project.modulesById ||
			subtask.parentId in project.subtasksById)

	if (hasExistingParents) {
		return {
			...project,
			subtasksById: { ...project.subtasksById, [subtask.id]: subtask },
		}
	}

	return project
}
