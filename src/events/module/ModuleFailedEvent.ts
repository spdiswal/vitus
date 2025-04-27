import { type ModuleId, newModule } from "+models/Module"
import { type Project, getModuleById, putModule } from "+models/Project"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

export type ModuleFailedEvent = {
	type: "module-failed"
	id: ModuleId
}

export function moduleFailedEvent(
	props: Omit<ModuleFailedEvent, "type">,
): ModuleFailedEvent {
	return { type: "module-failed", ...props }
}

export function applyModuleFailedEvent(
	project: Project,
	event: ModuleFailedEvent,
): Project {
	const existingModule = getModuleById(project, event.id)

	if (existingModule === null) {
		return project
	}

	const updatedModule = newModule({
		...existingModule,
		status: "failed",
	})

	return putModule(project, updatedModule)
}

export function logModuleFailedEvent(
	project: Project,
	event: ModuleFailedEvent,
): void {
	const { modules, ...loggableProject } = project

	const module = getModuleById(project, event.id)
	assertNotNullish(module)

	const { suitesAndTests, ...loggableModule } = module

	logDebug(
		{
			label: "Module failed",
			labelColour: "#b91c1c",
			message: module.filename,
		},
		{ event, module: loggableModule, project: loggableProject },
	)
}
