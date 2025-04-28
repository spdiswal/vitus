import { removeModulesByStatus } from "+models/Module"
import type { Project } from "+models/Project"
import { removeSubtasksByStatus } from "+models/Subtask"
import { logDebug } from "+utilities/Logging"

export type RunCompletedEvent = {
	type: "run-completed"
}

export function runCompletedEvent(): RunCompletedEvent {
	return { type: "run-completed" }
}

export function applyRunCompletedEvent(project: Project): Project {
	return removeModulesByStatus(
		removeSubtasksByStatus(project, "running"),
		"running",
	)
}

export function logRunCompletedEvent(event: RunCompletedEvent): void {
	logDebug(
		{
			label: "Run completed",
			labelColour: "#1d4ed8",
			message: "",
		},
		{ event },
	)
}
