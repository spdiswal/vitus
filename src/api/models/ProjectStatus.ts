import type { Module } from "+api/models/Module"
import type { ModuleId } from "+api/models/ModuleId"

export type ProjectStatus =
	| "disconnected"
	| "failed"
	| "passed"
	| "skipped"
	| "started"

export function computeProjectStatus(
	modulesById: Readonly<Record<ModuleId, Module>>,
): ProjectStatus {
	const statuses = new Set<ProjectStatus>()

	for (const module of Object.values(modulesById)) {
		if (module.status === "started") {
			return "started"
		}
		statuses.add(module.status)
	}

	if (statuses.has("failed")) {
		return "failed"
	}
	if (statuses.has("passed")) {
		return "passed"
	}
	return "skipped"
}
