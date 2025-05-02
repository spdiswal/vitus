import type { ModuleId } from "+api/models/ModuleId"
import type { Subtask } from "+api/models/Subtask"
import type { SubtaskId } from "+api/models/SubtaskId"

export type TaskId = ModuleId | SubtaskId
export type TaskIds = Array<TaskId>

export function byParentIds(parentIds: TaskIds): (subtask: Subtask) => boolean {
	const ids = new Set(parentIds)
	return (subtask): boolean => ids.has(subtask.parentId)
}
