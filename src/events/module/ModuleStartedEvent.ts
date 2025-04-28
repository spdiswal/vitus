import { type Module, putModule } from "+models/Module"
import type { Project } from "+models/Project"
import { logDebug } from "+utilities/Logging"

export type ModuleStartedEvent = {
	type: "module-started"
	module: Module
}

export function moduleStartedEvent(module: Module): ModuleStartedEvent {
	return { type: "module-started", module }
}

export function applyModuleStartedEvent(
	project: Project,
	event: ModuleStartedEvent,
): Project {
	return putModule(project, event.module)
}

export function logModuleStartedEvent(event: ModuleStartedEvent): void {
	logDebug(
		{
			label: "Module started",
			labelColour: "#b45309",
			message: event.module.filename,
		},
		{ event },
	)
}
