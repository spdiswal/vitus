import type { Project } from "+api/models/Project"
import { type Subtask, putSubtask } from "+api/models/Subtask"

export type SubtaskUpdated = {
	type: "subtask-updated"
	subtask: Subtask
}

export function subtaskUpdated(subtask: Subtask): SubtaskUpdated {
	return { type: "subtask-updated", subtask }
}

export function applySubtaskUpdated(
	project: Project,
	event: SubtaskUpdated,
): Project {
	return putSubtask(project, event.subtask)
}
