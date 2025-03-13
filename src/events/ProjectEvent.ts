import {
	type FileDeletedEvent,
	applyFileDeletedEvent,
	logFileDeletedEvent,
} from "+events/file/FileDeletedEvent"
import {
	type FileFailedEvent,
	applyFileFailedEvent,
	logFileFailedEvent,
} from "+events/file/FileFailedEvent"
import {
	type FilePassedEvent,
	applyFilePassedEvent,
	logFilePassedEvent,
} from "+events/file/FilePassedEvent"
import {
	type FileSkippedEvent,
	applyFileSkippedEvent,
	logFileSkippedEvent,
} from "+events/file/FileSkippedEvent"
import {
	type FileStartedEvent,
	applyFileStartedEvent,
	logFileStartedEvent,
} from "+events/file/FileStartedEvent"
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
	type SuiteFailedEvent,
	applySuiteFailedEvent,
	logSuiteFailedEvent,
} from "+events/suite/SuiteFailedEvent"
import {
	type SuitePassedEvent,
	applySuitePassedEvent,
	logSuitePassedEvent,
} from "+events/suite/SuitePassedEvent"
import {
	type SuiteSkippedEvent,
	applySuiteSkippedEvent,
	logSuiteSkippedEvent,
} from "+events/suite/SuiteSkippedEvent"
import {
	type SuiteStartedEvent,
	applySuiteStartedEvent,
	logSuiteStartedEvent,
} from "+events/suite/SuiteStartedEvent"
import {
	type TestFailedEvent,
	applyTestFailedEvent,
	logTestFailedEvent,
} from "+events/test/TestFailedEvent"
import {
	type TestPassedEvent,
	applyTestPassedEvent,
	logTestPassedEvent,
} from "+events/test/TestPassedEvent"
import {
	type TestSkippedEvent,
	applyTestSkippedEvent,
	logTestSkippedEvent,
} from "+events/test/TestSkippedEvent"
import {
	type TestStartedEvent,
	applyTestStartedEvent,
	logTestStartedEvent,
} from "+events/test/TestStartedEvent"
import type { Project } from "+models/Project"

export type ProjectEvent =
	| FileDeletedEvent
	| FileFailedEvent
	| FilePassedEvent
	| FileSkippedEvent
	| FileStartedEvent
	| RunCompletedEvent
	| RunStartedEvent
	| ServerDisconnectedEvent
	| ServerRestartedEvent
	| SuiteFailedEvent
	| SuitePassedEvent
	| SuiteSkippedEvent
	| SuiteStartedEvent
	| TestFailedEvent
	| TestPassedEvent
	| TestSkippedEvent
	| TestStartedEvent

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
		case "suite-failed": {
			return applySuiteFailedEvent(project, event)
		}
		case "suite-passed": {
			return applySuitePassedEvent(project, event)
		}
		case "suite-skipped": {
			return applySuiteSkippedEvent(project, event)
		}
		case "suite-started": {
			return applySuiteStartedEvent(project, event)
		}
		case "test-failed": {
			return applyTestFailedEvent(project, event)
		}
		case "test-passed": {
			return applyTestPassedEvent(project, event)
		}
		case "test-skipped": {
			return applyTestSkippedEvent(project, event)
		}
		case "test-started": {
			return applyTestStartedEvent(project, event)
		}
	}
}

export function logProjectEvents(
	project: Project,
	events: ProjectEvents,
): void {
	for (const event of events) {
		logProjectEvent(project, event)
	}
}

export function logProjectEvent(project: Project, event: ProjectEvent): void {
	switch (event.type) {
		case "file-deleted": {
			logFileDeletedEvent(project, event)
			break
		}
		case "file-failed": {
			logFileFailedEvent(project, event)
			break
		}
		case "file-passed": {
			logFilePassedEvent(project, event)
			break
		}
		case "file-skipped": {
			logFileSkippedEvent(project, event)
			break
		}
		case "file-started": {
			logFileStartedEvent(project, event)
			break
		}
		case "run-completed": {
			logRunCompletedEvent(project, event)
			break
		}
		case "run-started": {
			logRunStartedEvent(project, event)
			break
		}
		case "server-disconnected": {
			logServerDisconnectedEvent(project, event)
			break
		}
		case "server-restarted": {
			logServerRestartedEvent(project, event)
			break
		}
		case "suite-failed": {
			logSuiteFailedEvent(project, event)
			break
		}
		case "suite-passed": {
			logSuitePassedEvent(project, event)
			break
		}
		case "suite-skipped": {
			logSuiteSkippedEvent(project, event)
			break
		}
		case "suite-started": {
			logSuiteStartedEvent(project, event)
			break
		}
		case "test-failed": {
			logTestFailedEvent(project, event)
			break
		}
		case "test-passed": {
			logTestPassedEvent(project, event)
			break
		}
		case "test-skipped": {
			logTestSkippedEvent(project, event)
			break
		}
		case "test-started": {
			logTestStartedEvent(project, event)
			break
		}
	}
}
