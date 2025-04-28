import {
	type ModuleDeletedEvent,
	applyModuleDeletedEvent,
	logModuleDeletedEvent,
} from "+events/module/ModuleDeletedEvent"
import {
	type ModuleFailedEvent,
	applyModuleFailedEvent,
	logModuleFailedEvent,
} from "+events/module/ModuleFailedEvent"
import {
	type ModulePassedEvent,
	applyModulePassedEvent,
	logModulePassedEvent,
} from "+events/module/ModulePassedEvent"
import {
	type ModuleSkippedEvent,
	applyModuleSkippedEvent,
	logModuleSkippedEvent,
} from "+events/module/ModuleSkippedEvent"
import {
	type ModuleStartedEvent,
	applyModuleStartedEvent,
	logModuleStartedEvent,
} from "+events/module/ModuleStartedEvent"
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
	| ModuleDeletedEvent
	| ModuleFailedEvent
	| ModulePassedEvent
	| ModuleSkippedEvent
	| ModuleStartedEvent
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
		case "module-deleted": {
			return applyModuleDeletedEvent(project, event)
		}
		case "module-failed": {
			return applyModuleFailedEvent(project, event)
		}
		case "module-passed": {
			return applyModulePassedEvent(project, event)
		}
		case "module-skipped": {
			return applyModuleSkippedEvent(project, event)
		}
		case "module-started": {
			return applyModuleStartedEvent(project, event)
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
		case "module-failed": {
			logModuleFailedEvent(event)
			break
		}
		case "module-passed": {
			logModulePassedEvent(event)
			break
		}
		case "module-skipped": {
			logModuleSkippedEvent(event)
			break
		}
		case "module-started": {
			logModuleStartedEvent(event)
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
		case "suite-failed": {
			logSuiteFailedEvent(event)
			break
		}
		case "suite-passed": {
			logSuitePassedEvent(event)
			break
		}
		case "suite-skipped": {
			logSuiteSkippedEvent(event)
			break
		}
		case "suite-started": {
			logSuiteStartedEvent(event)
			break
		}
		case "test-failed": {
			logTestFailedEvent(event)
			break
		}
		case "test-passed": {
			logTestPassedEvent(event)
			break
		}
		case "test-skipped": {
			logTestSkippedEvent(event)
			break
		}
		case "test-started": {
			logTestStartedEvent(event)
			break
		}
	}
}
