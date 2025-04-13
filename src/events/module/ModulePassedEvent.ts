import { type ModuleId, newModule } from "+models/Module"
import { type Project, getModuleById, putModule } from "+models/Project"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

export type ModulePassedEvent = {
	type: "module-passed"
	duration: Duration
	id: ModuleId
}

export function modulePassedEvent(
	props: Omit<ModulePassedEvent, "type">,
): ModulePassedEvent {
	return { type: "module-passed", ...props }
}

export function applyModulePassedEvent(
	project: Project,
	event: ModulePassedEvent,
): Project {
	const existingModule = getModuleById(project, event.id)

	if (existingModule === null) {
		return project
	}

	const updatedModule = newModule({
		...existingModule,
		duration: event.duration,
		status: "passed",
	})

	return putModule(project, updatedModule)
}

export function logModulePassedEvent(
	project: Project,
	event: ModulePassedEvent,
): void {
	const { modules, ...loggableProject } = project

	const module = getModuleById(project, event.id)
	assertNotNullish(module)

	const { suitesAndTests, ...loggableModule } = module

	logDebug(
		{
			label: "Module passed",
			labelColour: "#15803d",
			message: module.filename,
		},
		{ event, module: loggableModule, project: loggableProject },
	)
}
