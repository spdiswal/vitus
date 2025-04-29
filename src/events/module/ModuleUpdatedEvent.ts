import { type Module, putModule } from "+models/Module"
import type { Project } from "+models/Project"
import type { TaskStatus } from "+models/TaskStatus"
import type { HexColour } from "+types/HexColour"
import { logDebug } from "+utilities/Logging"

export type ModuleUpdatedEvent = {
	type: "module-updated"
	module: Module
}

export function moduleUpdatedEvent(module: Module): ModuleUpdatedEvent {
	return { type: "module-updated", module }
}

export function applyModuleUpdatedEvent(
	project: Project,
	event: ModuleUpdatedEvent,
): Project {
	return putModule(project, event.module)
}

const coloursByStatus: Record<TaskStatus, HexColour> = {
	failed: "#b91c1c",
	passed: "#15803d",
	skipped: "#374151",
	started: "#b45309",
}

export function logModuleUpdatedEvent(event: ModuleUpdatedEvent): void {
	logDebug(
		{
			label: `module ${event.module.status}`,
			labelColour: coloursByStatus[event.module.status],
			message: event.module.filename,
		},
		{ event },
	)
}
