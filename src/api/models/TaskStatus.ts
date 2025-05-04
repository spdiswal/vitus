import type { Module } from "+api/models/Module"
import type { ModuleId } from "+api/models/ModuleId"
import type { Task } from "+api/models/Task"

export type TaskStatus = "failed" | "passed" | "skipped" | "started"
export type TaskStatuses = Array<TaskStatus>

export function byStatus(status: TaskStatus): (task: Task) => boolean {
	return (task): boolean => task.status === status
}

export function computeProjectStatus(
	modulesById: Readonly<Record<ModuleId, Module>>,
): TaskStatus {
	const statuses = new Set<TaskStatus>()

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
