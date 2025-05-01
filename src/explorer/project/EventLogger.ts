import type { Event, Events } from "+api/events/Event"
import type { ModuleDeleted } from "+api/events/ModuleDeleted"
import type { ModuleUpdated } from "+api/events/ModuleUpdated"
import type { RunStarted } from "+api/events/RunStarted"
import type { SubtaskUpdated } from "+api/events/SubtaskUpdated"
import type { TaskStatus } from "+api/models/TaskStatus"
import type { HexColour } from "+types/HexColour"
import { logDebug } from "+utilities/Logging"

export function logProjectEvents(events: Events): void {
	for (const event of events) {
		logProjectEvent(event)
	}
}

function logProjectEvent(event: Event): void {
	switch (event.type) {
		case "module-deleted": {
			logModuleDeleted(event)
			break
		}
		case "module-updated": {
			logModuleUpdated(event)
			break
		}
		case "run-completed": {
			logRunCompleted()
			break
		}
		case "run-started": {
			logRunStarted(event)
			break
		}
		case "server-disconnected": {
			logServerDisconnected()
			break
		}
		case "server-restarted": {
			logServerRestarted()
			break
		}
		case "subtask-updated": {
			logSubtaskUpdated(event)
			break
		}
	}
}

const coloursByStatus: Record<TaskStatus, HexColour> = {
	failed: "#b91c1c",
	passed: "#15803d",
	skipped: "#374151",
	started: "#b45309",
}

function logModuleDeleted(event: ModuleDeleted): void {
	logDebug("#374151", "module deleted", event.path)
}

function logModuleUpdated(event: ModuleUpdated): void {
	logDebug(
		coloursByStatus[event.module.status],
		`module ${event.module.status}`,
		event.module.filename,
		event.module,
	)
}

function logRunCompleted(): void {
	logDebug("#1d4ed8", "run completed")
}

function logRunStarted(event: RunStarted): void {
	logDebug("#1d4ed8", "run started", "", {
		invalidatedIds: event.invalidatedIds,
	})
}

function logServerDisconnected(): void {
	logDebug("#a21caf", "server disconnected")
}

function logServerRestarted(): void {
	logDebug("#a21caf", "server restarted")
}

function logSubtaskUpdated(event: SubtaskUpdated): void {
	logDebug(
		coloursByStatus[event.subtask.status],
		`${event.subtask.type} ${event.subtask.status}`,
		event.subtask.name,
		event.subtask,
	)
}
