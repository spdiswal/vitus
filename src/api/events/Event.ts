import {
	type ModuleDeleted,
	applyModuleDeleted,
} from "+api/events/ModuleDeleted"
import {
	type ModuleUpdated,
	applyModuleUpdated,
} from "+api/events/ModuleUpdated"
import { type RunCompleted, applyRunCompleted } from "+api/events/RunCompleted"
import { type RunStarted, applyRunStarted } from "+api/events/RunStarted"
import {
	type ServerDisconnected,
	applyServerDisconnected,
} from "+api/events/ServerDisconnected"
import {
	type ServerRestarted,
	applyServerRestarted,
} from "+api/events/ServerRestarted"
import {
	type SubtaskUpdated,
	applySubtaskUpdated,
} from "+api/events/SubtaskUpdated"
import type { Project } from "+api/models/Project"

export type Event =
	| ModuleDeleted
	| ModuleUpdated
	| RunCompleted
	| RunStarted
	| ServerDisconnected
	| ServerRestarted
	| SubtaskUpdated

export type Events = Array<Event>

export function applyEvents(project: Project, events: Events): Project {
	return events.reduce(applyEvent, project)
}

export function applyEvent(project: Project, event: Event): Project {
	switch (event.type) {
		case "module-deleted": {
			return applyModuleDeleted(project, event)
		}
		case "module-updated": {
			return applyModuleUpdated(project, event)
		}
		case "run-completed": {
			return applyRunCompleted(project)
		}
		case "run-started": {
			return applyRunStarted(project, event)
		}
		case "server-disconnected": {
			return applyServerDisconnected(project)
		}
		case "server-restarted": {
			return applyServerRestarted(project)
		}
		case "subtask-updated": {
			return applySubtaskUpdated(project, event)
		}
	}
}
