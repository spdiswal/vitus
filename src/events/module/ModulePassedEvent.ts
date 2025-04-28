import { type Module, isExistingModule, putModule } from "+models/Module"
import type { Project } from "+models/Project"
import { logDebug } from "+utilities/Logging"

export type ModulePassedEvent = {
	type: "module-passed"
	module: Module
}

export function modulePassedEvent(module: Module): ModulePassedEvent {
	return { type: "module-passed", module }
}

export function applyModulePassedEvent(
	project: Project,
	event: ModulePassedEvent,
): Project {
	return isExistingModule(project, event.module)
		? putModule(project, event.module)
		: project
}

export function logModulePassedEvent(event: ModulePassedEvent): void {
	logDebug(
		{
			label: "Module passed",
			labelColour: "#15803d",
			message: event.module.filename,
		},
		{ event },
	)
}
