import { type Module, isExistingModule, putModule } from "+models/Module"
import type { Project } from "+models/Project"
import { logDebug } from "+utilities/Logging"

export type ModuleSkippedEvent = {
	type: "module-skipped"
	module: Module
}

export function moduleSkippedEvent(module: Module): ModuleSkippedEvent {
	return { type: "module-skipped", module }
}

export function applyModuleSkippedEvent(
	project: Project,
	event: ModuleSkippedEvent,
): Project {
	return isExistingModule(project, event.module)
		? putModule(project, event.module)
		: project
}

export function logModuleSkippedEvent(event: ModuleSkippedEvent): void {
	logDebug(
		{
			label: "Module skipped",
			labelColour: "#374151",
			message: event.module.filename,
		},
		{ event },
	)
}
