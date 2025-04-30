import { type Module, getModuleById, hasModule } from "+api/models/Module"
import { type Project, newProject } from "+api/models/Project"
import type { Suite } from "+api/models/Suite"
import type { TaskId, TaskIds } from "+api/models/TaskId"
import type { TaskStatus } from "+api/models/TaskStatus"
import type { Test } from "+api/models/Test"
import { assertNotNullish } from "+utilities/Assertions"

export type Subtask = Suite | Test
export type Subtasks = Array<Subtask>

export function hasSubtask(project: Project, subtaskId: TaskId): boolean {
	return subtaskId in project.subtasksById
}

export function getSubtaskById(project: Project, subtaskId: TaskId): Subtask {
	const subtask = project.subtasksById[subtaskId]
	assertNotNullish(subtask, "subtask")

	return subtask
}

export function getSubtasksByModuleIds(
	project: Project,
	moduleIds: TaskIds,
): Subtasks {
	return Object.values(project.subtasksById).filter((subtask) =>
		moduleIds.includes(subtask.parentModuleId),
	)
}

export function hasExistingParents(
	project: Project,
	subtask: Subtask,
): boolean {
	return (
		subtask.parentModuleId in project.modulesById &&
		(subtask.parentId in project.modulesById ||
			subtask.parentId in project.subtasksById)
	)
}

export function putSubtask(project: Project, subtask: Subtask): Project {
	return hasExistingParents(project, subtask)
		? newProject({
				...project,
				subtasksById: { ...project.subtasksById, [subtask.id]: subtask },
			})
		: project
}

export function removeSubtasksByStatus(
	project: Project,
	status: TaskStatus,
): Project {
	const remainingSubtasksById = Object.fromEntries(
		Object.entries(project.subtasksById).filter(
			([, subtask]) => subtask.status !== status,
		),
	)

	return newProject({ ...project, subtasksById: remainingSubtasksById })
}

export function enumerateSubtaskAncestors(
	project: Project,
	subtask: Subtask,
): Iterable<Module | Subtask> {
	const ancestors: Array<Module | Subtask> = []
	let currentParentId: TaskId | null = subtask.parentId

	while (currentParentId !== null) {
		if (hasSubtask(project, currentParentId)) {
			const parent = getSubtaskById(project, currentParentId)
			ancestors.push(parent)
			currentParentId = parent.parentId
		} else if (hasModule(project, currentParentId)) {
			const parent = getModuleById(project, currentParentId)
			ancestors.push(parent)
			currentParentId = null
		} else {
			break
		}
	}

	ancestors.reverse()
	return ancestors
}
