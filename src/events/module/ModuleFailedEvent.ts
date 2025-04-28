import { type Module, isExistingModule, putModule } from "+models/Module"
import type { Project } from "+models/Project"
import { logDebug } from "+utilities/Logging"

export type ModuleFailedEvent = {
	type: "module-failed"
	module: Module
}

export function moduleFailedEvent(module: Module): ModuleFailedEvent {
	return { type: "module-failed", module }
}

export function applyModuleFailedEvent(
	project: Project,
	event: ModuleFailedEvent,
): Project {
	return isExistingModule(project, event.module)
		? putModule(project, event.module)
		: project
}

export function logModuleFailedEvent(event: ModuleFailedEvent): void {
	logDebug(
		{
			label: "Module failed",
			labelColour: "#b91c1c",
			message: event.module.filename,
		},
		{ event },
	)
}
