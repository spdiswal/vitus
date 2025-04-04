import type { SubtaskDto } from "+api/models/SubtaskDto"
import { type Suite, dtoToSuite, suiteToDto } from "+explorer/models/Suite"
import type { Task } from "+explorer/models/Task"
import { type Test, dtoToTest, testToDto } from "+explorer/models/Test"
import type { Comparator } from "+types/Comparator"
import type { Computed, Reactive } from "+types/Reactive"
import type { TaskId } from "+types/TaskId"
import type { TaskStatus } from "+types/TaskStatus"
import { arrayEquals } from "+utilities/Arrays"
import { filterIterable } from "+utilities/Iterables"
import { enumerateObjectValues, filterObjectByValue } from "+utilities/Objects"
import { signal, useComputed } from "@preact/signals"
import { useRef } from "preact/hooks"

export type Subtask = Suite | Test
export type Subtasks = Array<Subtask>

// Suites and tests use a shared id namespace in Vitest (i.e. it is impossible to determine from an id alone whether it is a suite or test).
const subtasksById: Reactive<Record<TaskId, Subtask>> = signal({})

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

const byId: Comparator<Subtask> = (a, b) => a.id.localeCompare(b.id)

export function useSubtasks(parent: Task): Computed<Subtasks> {
	const cachedSubtasks = useRef<Subtasks>([])

	return useComputed<Subtasks>(() => {
		if (parent.type === "test") {
			return cachedSubtasks.current
		}

		const subtasks = Array.from(enumerateSubtasksByParent(parent.id)).sort(byId)

		if (arrayEquals(cachedSubtasks.current, subtasks)) {
			return cachedSubtasks.current
		}

		cachedSubtasks.current = subtasks
		return subtasks
	})
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
