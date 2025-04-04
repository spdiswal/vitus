import {
	type File,
	enumerateFilesByStatuses,
	getFileById,
	removeAllFiles,
	removeFilesByStatuses,
} from "+explorer/models/File"
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

export type Task = File | Subtask

export function* enumerateTasksByStatuses(
	statusesToInclude: Array<TaskStatus>,
): Iterable<Task> {
	yield* enumerateFilesByStatuses(statusesToInclude)
	yield* enumerateSubtasksByStatuses(statusesToInclude)
}

export function removeTasksByStatuses(
	statusesToRemove: Array<TaskStatus>,
): void {
	removeFilesByStatuses(statusesToRemove)
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

function* enumerateOrphanedSubtasks(): Iterable<Subtask> {
	return filterIterable(
		enumerateSubtasks(),
		(subtask) =>
			getFileById(subtask.parentId) === null &&
			getSubtaskById(subtask.parentId) === null,
	)
}

export function removeAllTasks(): void {
	removeAllFiles()
	removeAllSubtasks()
}
