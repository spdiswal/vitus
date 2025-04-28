import { type Module, getModuleById } from "+models/Module"
import { type Project, newProject } from "+models/Project"
import type { Suite } from "+models/Suite"
import type { TaskId } from "+models/TaskId"
import type { TaskStatus } from "+models/TaskStatus"
import type { Test } from "+models/Test"

export type Subtask = Suite | Test
export type Subtasks = Array<Subtask>

export function getSubtaskById(project: Project, id: TaskId): Subtask | null {
	return project.subtasksById[id] ?? null
}

export function isExistingSubtask(project: Project, subtask: Subtask): boolean {
	return subtask.id in project.subtasksById
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
	return newProject({
		...project,
		subtasksById: { ...project.subtasksById, [subtask.id]: subtask },
	})
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
		const parent: Module | Subtask | null =
			getSubtaskById(project, currentParentId) ??
			getModuleById(project, currentParentId)

		if (parent === null) {
			break
		}

		ancestors.push(parent)
		currentParentId = parent.type !== "module" ? parent.parentId : null
	}

	ancestors.reverse()
	return ancestors
}
