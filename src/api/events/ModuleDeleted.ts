import { removeModulesByPath } from "+api/models/Module"
import type { Project } from "+api/models/Project"
import type { Path } from "+types/Path"

export type ModuleDeleted = {
	type: "module-deleted"
	path: Path
}

export function moduleDeleted(path: Path): ModuleDeleted {
	return { type: "module-deleted", path }
}

export function applyModuleDeleted(
	project: Project,
	event: ModuleDeleted,
): Project {
	return removeModulesByPath(project, event.path)
}
