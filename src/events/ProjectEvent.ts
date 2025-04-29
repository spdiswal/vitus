import {
	type ModuleDeletedEvent,
	applyModuleDeletedEvent,
	logModuleDeletedEvent,
} from "+events/module/ModuleDeletedEvent"
import {
	type ModuleUpdatedEvent,
	applyModuleUpdatedEvent,
	logModuleUpdatedEvent,
} from "+events/module/ModuleUpdatedEvent"
import {
	type RunCompletedEvent,
	applyRunCompletedEvent,
	logRunCompletedEvent,
} from "+events/run/RunCompletedEvent"
import {
	type RunStartedEvent,
	applyRunStartedEvent,
	logRunStartedEvent,
} from "+events/run/RunStartedEvent"
import {
	type ServerDisconnectedEvent,
	applyServerDisconnectedEvent,
	logServerDisconnectedEvent,
} from "+events/server/ServerDisconnectedEvent"
import {
	type ServerRestartedEvent,
	applyServerRestartedEvent,
	logServerRestartedEvent,
} from "+events/server/ServerRestartedEvent"
import {
	type SubtaskUpdatedEvent,
	applySubtaskUpdatedEvent,
	logSubtaskUpdatedEvent,
} from "+events/subtask/SubtaskUpdatedEvent"
import type { Project } from "+models/Project"

export type ProjectEvent =
	| ModuleDeletedEvent
	| ModuleUpdatedEvent
	| RunCompletedEvent
	| RunStartedEvent
	| ServerDisconnectedEvent
	| ServerRestartedEvent
	| SubtaskUpdatedEvent

export type ProjectEvents = Array<ProjectEvent>

export function applyProjectEvents(
	project: Project,
	events: ProjectEvents,
): Project {
	return events.reduce(applyProjectEvent, project)
}

export function applyProjectEvent(
	project: Project,
	event: ProjectEvent,
): Project {
	switch (event.type) {
		case "module-deleted": {
			return applyModuleDeletedEvent(project, event)
		}
		case "module-updated": {
			return applyModuleUpdatedEvent(project, event)
		}
		case "run-completed": {
			return applyRunCompletedEvent(project)
		}
		case "run-started": {
			return applyRunStartedEvent(project, event)
		}
		case "server-disconnected": {
			return applyServerDisconnectedEvent(project)
		}
		case "server-restarted": {
			return applyServerRestartedEvent(project)
		}
		case "subtask-updated": {
			return applySubtaskUpdatedEvent(project, event)
		}
	}
}

export function logProjectEvents(events: ProjectEvents): void {
	for (const event of events) {
		logProjectEvent(event)
	}
}

export function logProjectEvent(event: ProjectEvent): void {
	switch (event.type) {
		case "module-deleted": {
			logModuleDeletedEvent(event)
			break
		}
		case "module-updated": {
			logModuleUpdatedEvent(event)
			break
		}
		case "run-completed": {
			logRunCompletedEvent(event)
			break
		}
		case "run-started": {
			logRunStartedEvent(event)
			break
		}
		case "server-disconnected": {
			logServerDisconnectedEvent(event)
			break
		}
		case "server-restarted": {
			logServerRestartedEvent(event)
			break
		}
		case "subtask-updated": {
			logSubtaskUpdatedEvent(event)
			break
		}
	}
}
