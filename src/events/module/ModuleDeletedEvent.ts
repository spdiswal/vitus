import { type Project, getModuleByPath, newProject } from "+models/Project"
import type { Path } from "+types/Path"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

export type ModuleDeletedEvent = {
	type: "module-deleted"
	path: Path
}

export function moduleDeletedEvent(
	props: Omit<ModuleDeletedEvent, "type">,
): ModuleDeletedEvent {
	return { type: "module-deleted", ...props }
}

export function applyModuleDeletedEvent(
	project: Project,
	event: ModuleDeletedEvent,
): Project {
	return newProject({
		...project,
		modules: project.modules.filter((module) => module.path !== event.path),
	})
}

export function logModuleDeletedEvent(
	project: Project,
	event: ModuleDeletedEvent,
): void {
	const { modules, ...loggableProject } = project

	const module = getModuleByPath(project, event.path)
	assertNotNullish(module)

	const { suitesAndTests, ...loggableModule } = module

	logDebug(
		{
			label: "Module deleted",
			labelColour: "#374151",
			message: module.filename,
		},
		{ event, module: loggableModule, project: loggableProject },
	)
}
