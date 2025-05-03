import type { Subtask } from "+api/models/Subtask"
import type { SuiteId } from "+api/models/SuiteId"
import type { TestId } from "+api/models/TestId"

export type SubtaskId = SuiteId | TestId
export type SubtaskIds = Array<SubtaskId>

export function bySubtaskIds(
	subtaskIds: SubtaskIds,
): (subtask: Subtask) => boolean {
	const ids = new Set(subtaskIds)
	return (subtask): boolean => ids.has(subtask.id)
}
