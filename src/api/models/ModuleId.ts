import type { Module } from "+api/models/Module"
import type { Subtask } from "+api/models/Subtask"
import type { Flavour } from "+types/Flavour"

export type ModuleId = string & Flavour<"ModuleId">
export type ModuleIds = Array<ModuleId>

export function byModuleIds(moduleIds: ModuleIds): (module: Module) => boolean {
	const ids = new Set(moduleIds)
	return (module): boolean => ids.has(module.id)
}

export function byParentModuleIds(
	moduleIds: ModuleIds,
): (subtask: Subtask) => boolean {
	const ids = new Set(moduleIds)
	return (subtask): boolean => ids.has(subtask.parentModuleId)
}
