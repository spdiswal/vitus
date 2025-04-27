import { type ModuleId, newModule } from "+models/Module"
import { type Project, getModuleById, putModule } from "+models/Project"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

export type ModuleSkippedEvent = {
	type: "module-skipped"
	id: ModuleId
}

export function moduleSkippedEvent(
	props: Omit<ModuleSkippedEvent, "type">,
): ModuleSkippedEvent {
	return { type: "module-skipped", ...props }
}

export function applyModuleSkippedEvent(
	project: Project,
	event: ModuleSkippedEvent,
): Project {
	const existingModule = getModuleById(project, event.id)

	if (existingModule === null) {
		return project
	}

	const updatedModule = newModule({
		...existingModule,
		status: "skipped",
	})

	return putModule(project, updatedModule)
}

export function logModuleSkippedEvent(
	project: Project,
	event: ModuleSkippedEvent,
): void {
	const { modules, ...loggableProject } = project

	const module = getModuleById(project, event.id)
	assertNotNullish(module)

	const { suitesAndTests, ...loggableModule } = module

	logDebug(
		{
			label: "Module skipped",
			labelColour: "#374151",
			message: module.filename,
		},
		{ event, module: loggableModule, project: loggableProject },
	)
}
