import { removeModulesByPath } from "+models/Module"
import type { Project } from "+models/Project"
import type { Path } from "+types/Path"
import { logDebug } from "+utilities/Logging"

export type ModuleDeletedEvent = {
	type: "module-deleted"
	path: Path
}

export function moduleDeletedEvent(path: Path): ModuleDeletedEvent {
	return { type: "module-deleted", path }
}

export function applyModuleDeletedEvent(
	project: Project,
	event: ModuleDeletedEvent,
): Project {
	return removeModulesByPath(project, event.path)
}

export function logModuleDeletedEvent(event: ModuleDeletedEvent): void {
	logDebug(
		{
			label: "Module deleted",
			labelColour: "#374151",
			message: event.path,
		},
		{ event },
	)
}
