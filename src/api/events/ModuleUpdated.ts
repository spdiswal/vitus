import { type Module, putModule } from "+api/models/Module"
import type { Project } from "+api/models/Project"

export type ModuleUpdated = {
	type: "module-updated"
	module: Module
}

export function moduleUpdated(module: Module): ModuleUpdated {
	return { type: "module-updated", module }
}

export function applyModuleUpdated(
	project: Project,
	event: ModuleUpdated,
): Project {
	return putModule(project, event.module)
}
