import type { SubtaskDto } from "+api/models/SubtaskDto"
import { type Suite, dtoToSuite, suiteToDto } from "+explorer/models/Suite"
import { type Test, dtoToTest, testToDto } from "+explorer/models/Test"
import type { Reactive } from "+types/Reactive"
import type { TaskId } from "+types/TaskId"
import type { TaskStatus } from "+types/TaskStatus"
import { filterIterable } from "+utilities/Iterables"
import { enumerateObjectValues, filterObjectByValue } from "+utilities/Objects"
import { signal } from "@preact/signals"

export type Subtask = Suite | Test
export type Subtasks = Array<Subtask>

// Suites and tests use a shared id namespace in Vitest (i.e. it is impossible to determine from an id alone whether it is a suite or test).
export const subtasksById: Reactive<Record<TaskId, Subtask>> = signal({})

export function initialiseSubtasks(dtos: Array<SubtaskDto>): void {
	subtasksById.value = Object.fromEntries(
		dtos.map(dtoToSubtask).map((subtask) => [subtask.id, subtask]),
	)
}

export function dtoToSubtask(dto: SubtaskDto): Subtask {
	return dto.type === "suite" ? dtoToSuite(dto) : dtoToTest(dto)
}

export function subtaskToDto(subtask: Subtask): SubtaskDto {
	return subtask.type === "suite" ? suiteToDto(subtask) : testToDto(subtask)
}

export function getSubtaskById(subtaskId: TaskId): Subtask | null {
	return subtasksById.value[subtaskId] ?? null
}

export function addSubtask(subtask: Subtask): void {
	subtasksById.value = { ...subtasksById.value, [subtask.id]: subtask }
}

export function* enumerateSubtasksByParent(
	parentId: TaskId,
): Iterable<Subtask> {
	return filterIterable(
		enumerateSubtasks(),
		(subtask) => subtask.parentId === parentId,
	)
}

export function* enumerateSubtasksByParents(
	parentIds: Set<TaskId>,
): Iterable<Subtask> {
	return filterIterable(enumerateSubtasks(), (subtask) =>
		parentIds.has(subtask.parentId),
	)
}

export function* enumerateSubtasksByStatuses(
	statusesToInclude: Array<TaskStatus>,
): Iterable<Subtask> {
	const statuses = new Set(statusesToInclude)

	return filterIterable(enumerateSubtasks(), (subtask) =>
		statuses.has(subtask.status.value),
	)
}

export function enumerateSubtasks(): Iterable<Subtask> {
	return enumerateObjectValues(subtasksById.value)
}

export function removeSubtasksByIds(idsToRemove: Set<TaskId>): void {
	subtasksById.value = filterObjectByValue(
		subtasksById.value,
		(subtask) => !idsToRemove.has(subtask.id),
	)
}

export function removeSubtasksByStatuses(
	statusesToRemove: Array<TaskStatus>,
): void {
	const statuses = new Set(statusesToRemove)

	subtasksById.value = filterObjectByValue(
		subtasksById.value,
		(subtask) => !statuses.has(subtask.status.value),
	)
}

export function removeAllSubtasks(): void {
	subtasksById.value = {}
}
