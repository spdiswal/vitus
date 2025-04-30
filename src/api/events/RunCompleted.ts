import { removeModulesByStatus } from "+api/models/Module"
import type { Project } from "+api/models/Project"
import { removeSubtasksByStatus } from "+api/models/Subtask"

export type RunCompleted = {
	type: "run-completed"
}

export function runCompleted(): RunCompleted {
	return { type: "run-completed" }
}

export function applyRunCompleted(project: Project): Project {
	return removeModulesByStatus(
		removeSubtasksByStatus(project, "started"),
		"started",
	)
}
