import type { EventDto } from "+api/events/EventDto"
import type { ModuleDeletedDto } from "+api/events/ModuleDeletedDto"
import type { RunStartedDto } from "+api/events/RunStartedDto"
import type { TaskUpdatedDto } from "+api/events/TaskUpdatedDto"
import type { HexColour } from "+types/HexColour"
import type { TaskStatus } from "+types/TaskStatus"
import { logDebug } from "+utilities/Logging"

export function logEvent(event: EventDto): void {
	// Ordered by frequency during a test session, from most common to rarest.
	if (event.type === "task-updated") {
		logTaskUpdated(event)
	}
	if (event.type === "run-started") {
		logRunStarted(event)
	}
	if (event.type === "run-completed") {
		logRunCompleted()
	}
	if (event.type === "module-deleted") {
		logModuleDeleted(event)
	}
	if (event.type === "server-disconnected") {
		logServerDisconnected()
	}
	if (event.type === "server-restarted") {
		logServerRestarted()
	}
}

const coloursByStatus: Record<TaskStatus, HexColour> = {
	failed: "#b91c1c",
	passed: "#15803d",
	queued: "#44403c",
	skipped: "#374151",
	started: "#b45309",
}

export function logTaskUpdated(event: TaskUpdatedDto): void {
	const task = event.task
	const { type: _ignored, ...loggableTask } = task

	logDebug(
		{
			label: `${task.type} ${task.status}`,
			labelColour: coloursByStatus[task.status],
			message: task.type === "module" ? task.path : task.name,
		},
		loggableTask,
	)
}

export function logRunStarted(event: RunStartedDto): void {
	logDebug(
		{
			label: "run started",
			labelColour: "#1d4ed8",
			message: "",
		},
		{ invalidatedModuleIds: event.invalidatedModuleIds },
	)
}

export function logRunCompleted(): void {
	logDebug({
		label: "run completed",
		labelColour: "#1d4ed8",
		message: "",
	})
}

export function logModuleDeleted(event: ModuleDeletedDto): void {
	logDebug({
		label: "module deleted",
		labelColour: "#374151",
		message: event.path,
	})
}

export function logServerDisconnected(): void {
	logDebug({
		label: "server disconnected",
		labelColour: "#a21caf",
		message: "",
	})
}

export function logServerRestarted(): void {
	logDebug({
		label: "server restarted",
		labelColour: "#a21caf",
		message: "",
	})
}
