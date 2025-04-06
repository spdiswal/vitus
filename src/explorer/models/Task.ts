import {
	type Module,
	enumerateModulesByStatuses,
	getModuleById,
	removeAllModules,
	removeModulesByStatuses,
} from "+explorer/models/Module"
import {
	type Subtask,
	enumerateSubtasks,
	enumerateSubtasksByParents,
	enumerateSubtasksByStatuses,
	getSubtaskById,
	removeAllSubtasks,
	removeSubtasksByIds,
	removeSubtasksByStatuses,
} from "+explorer/models/Subtask"
import type { TaskStatus } from "+types/TaskStatus"
import { filterIterable, mapIterable } from "+utilities/Iterables"

export type Task = Module | Subtask

export function* enumerateTasksByStatuses(
	statusesToInclude: Array<TaskStatus>,
): Iterable<Task> {
	yield* enumerateModulesByStatuses(statusesToInclude)
	yield* enumerateSubtasksByStatuses(statusesToInclude)
}

export function removeTasksByStatuses(
	statusesToRemove: Array<TaskStatus>,
): void {
	removeModulesByStatuses(statusesToRemove)
	removeSubtasksByStatuses(statusesToRemove)
	removeOrphanedSubtasks()
}

export function removeOrphanedSubtasks(): void {
	const orphanIds = new Set(
		mapIterable(enumerateOrphanedSubtasks(), (subtask) => subtask.id),
	)

	let oldNumberOfOrphans = 0
	let numberOfOrphans = orphanIds.size

	if (numberOfOrphans === 0) {
		return
	}

	while (numberOfOrphans > oldNumberOfOrphans) {
		oldNumberOfOrphans = numberOfOrphans
		const childrenOfOrphans = enumerateSubtasksByParents(orphanIds)

		for (const subtask of childrenOfOrphans) {
			orphanIds.add(subtask.id)
		}

		numberOfOrphans = orphanIds.size
	}

	removeSubtasksByIds(orphanIds)
}

function enumerateOrphanedSubtasks(): Iterable<Subtask> {
	return filterIterable(
		enumerateSubtasks(),
		(subtask) =>
			getModuleById(subtask.parentId) === null &&
			getSubtaskById(subtask.parentId) === null,
	)
}

export function removeAllTasks(): void {
	removeAllModules()
	removeAllSubtasks()
}
