import type { Project } from "+models/Project"
import { type Subtask, putSubtask } from "+models/Subtask"
import type { TaskStatus } from "+models/TaskStatus"
import type { HexColour } from "+types/HexColour"
import { logDebug } from "+utilities/Logging"

export type SubtaskUpdatedEvent = {
	type: "subtask-updated"
	subtask: Subtask
}

export function subtaskUpdatedEvent(subtask: Subtask): SubtaskUpdatedEvent {
	return { type: "subtask-updated", subtask }
}

export function applySubtaskUpdatedEvent(
	project: Project,
	event: SubtaskUpdatedEvent,
): Project {
	return putSubtask(project, event.subtask)
}

const coloursByStatus: Record<TaskStatus, HexColour> = {
	failed: "#b91c1c",
	passed: "#15803d",
	skipped: "#374151",
	started: "#b45309",
}

export function logSubtaskUpdatedEvent(event: SubtaskUpdatedEvent): void {
	logDebug(
		{
			label: `${event.subtask.type} ${event.subtask.status}`,
			labelColour: coloursByStatus[event.subtask.status],
			message: event.subtask.name,
		},
		{ event },
	)
}
