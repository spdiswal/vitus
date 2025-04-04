import { enumerateFiles } from "+explorer/models/File"
import type { Computed, Reactive } from "+types/Reactive"
import type { TaskStatus } from "+types/TaskStatus"
import { mapIterable } from "+utilities/Iterables"
import { signal } from "@preact/signals"

export type RootStatus =
	| "disconnected"
	| "failed"
	| "passed"
	| "skipped"
	| "started"

const rootStatus: Reactive<RootStatus> = signal("disconnected")

export function useRootStatus(): Computed<RootStatus> {
	return rootStatus
}

export function setRootStatus(status: RootStatus): void {
	rootStatus.value = status
}

export function refreshRootStatus(): void {
	const taskStatuses = new Set(
		mapIterable(enumerateFiles(), (file) => file.status.value),
	)

	rootStatus.value = getRootStatus(taskStatuses)
}

export function getRootStatus(statuses: Set<TaskStatus>): RootStatus {
	if (statuses.has("queued") || statuses.has("started")) {
		return "started"
	}
	if (statuses.has("failed")) {
		return "failed"
	}
	if (statuses.has("passed")) {
		return "passed"
	}
	return "skipped"
}
