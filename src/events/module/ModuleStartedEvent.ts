import { type ModuleId, newModule } from "+models/Module"
import { type Project, getModuleById, putModule } from "+models/Project"
import type { Path } from "+types/Path"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

export type ModuleStartedEvent = {
	type: "module-started"
	id: ModuleId
	path: Path
}

export function moduleStartedEvent(
	props: Omit<ModuleStartedEvent, "type">,
): ModuleStartedEvent {
	return { type: "module-started", ...props }
}

export function applyModuleStartedEvent(
	project: Project,
	event: ModuleStartedEvent,
): Project {
	const existingModule = getModuleById(project, event.id)

	const updatedModule = newModule({
		id: event.id,
		duration: 0,
		path: event.path,
		status: "running",
		suitesAndTests: existingModule?.suitesAndTests ?? [],
	})

	return putModule(project, updatedModule)
}

export function logModuleStartedEvent(
	project: Project,
	event: ModuleStartedEvent,
): void {
	const { modules, ...loggableProject } = project

	const module = getModuleById(project, event.id)
	assertNotNullish(module)

	const { suitesAndTests, ...loggableModule } = module

	logDebug(
		{
			label: "Module started",
			labelColour: "#b45309",
			message: module.filename,
		},
		{ event, module: loggableModule, project: loggableProject },
	)
}
