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
	type RunCompletedEvent,
	applyRunCompletedEvent,
} from "+events/run/RunCompletedEvent"
import {
	type RunStartedEvent,
	applyRunStartedEvent,
} from "+events/run/RunStartedEvent"
import {
	type ServerDisconnectedEvent,
	applyServerDisconnectedEvent,
} from "+events/server/ServerDisconnectedEvent"
import {
	type ServerRestartedEvent,
	applyServerRestartedEvent,
} from "+events/server/ServerRestartedEvent"
import {
	type SuiteFailedEvent,
	applySuiteFailedEvent,
} from "+events/suite/SuiteFailedEvent"
import {
	type SuitePassedEvent,
	applySuitePassedEvent,
} from "+events/suite/SuitePassedEvent"
import {
	type SuiteSkippedEvent,
	applySuiteSkippedEvent,
} from "+events/suite/SuiteSkippedEvent"
import {
	type SuiteStartedEvent,
	applySuiteStartedEvent,
} from "+events/suite/SuiteStartedEvent"
import {
	type TestFailedEvent,
	applyTestFailedEvent,
} from "+events/test/TestFailedEvent"
import {
	type TestPassedEvent,
	applyTestPassedEvent,
} from "+events/test/TestPassedEvent"
import {
	type TestSkippedEvent,
	applyTestSkippedEvent,
} from "+events/test/TestSkippedEvent"
import {
	type TestStartedEvent,
	applyTestStartedEvent,
} from "+events/test/TestStartedEvent"
import type { Project } from "+models/Project"

export type Event =
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
