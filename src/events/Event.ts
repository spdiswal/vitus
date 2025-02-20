import {
	type FileDeletedEvent,
	applyFileDeletedEvent,
} from "+events/file/FileDeletedEvent"
import {
	type FileFailedEvent,
	applyFileFailedEvent,
} from "+events/file/FileFailedEvent"
import {
	type FilePassedEvent,
	applyFilePassedEvent,
} from "+events/file/FilePassedEvent"
import {
	type FileSkippedEvent,
	applyFileSkippedEvent,
} from "+events/file/FileSkippedEvent"
import {
	type FileStartedEvent,
	applyFileStartedEvent,
} from "+events/file/FileStartedEvent"
import {
	type ServerDisconnectedEvent,
	applyServerDisconnectedEvent,
} from "+events/server/ServerDisconnectedEvent"
import {
	type ServerRestartedEvent,
	applyServerRestartedEvent,
} from "+events/server/ServerRestartedEvent"
import type { Project } from "+models/Project"

export type Event =
	| FileDeletedEvent
	| FileFailedEvent
	| FilePassedEvent
	| FileSkippedEvent
	| FileStartedEvent
	| ServerDisconnectedEvent
	| ServerRestartedEvent

export function applyEvent(project: Project, event: Event): Project {
	switch (event.type) {
		case "file-deleted": {
			return applyFileDeletedEvent(project, event)
		}
		case "file-failed": {
			return applyFileFailedEvent(project, event)
		}
		case "file-passed": {
			return applyFilePassedEvent(project, event)
		}
		case "file-skipped": {
			return applyFileSkippedEvent(project, event)
		}
		case "file-started": {
			return applyFileStartedEvent(project, event)
		}
		case "server-disconnected": {
			return applyServerDisconnectedEvent(project)
		}
		case "server-restarted": {
			return applyServerRestartedEvent(project)
		}
	}
}
