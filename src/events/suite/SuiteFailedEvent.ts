import type { Project } from "+models/Project"
import {
	hasExistingParents,
	isExistingSubtask,
	putSubtask,
} from "+models/Subtask"
import type { Suite } from "+models/Suite"
import { logDebug } from "+utilities/Logging"

export type SuiteFailedEvent = {
	type: "suite-failed"
	suite: Suite
}

export function suiteFailedEvent(suite: Suite): SuiteFailedEvent {
	return { type: "suite-failed", suite }
}

export function applySuiteFailedEvent(
	project: Project,
	event: SuiteFailedEvent,
): Project {
	return isExistingSubtask(project, event.suite) &&
		hasExistingParents(project, event.suite)
		? putSubtask(project, event.suite)
		: project
}

export function logSuiteFailedEvent(event: SuiteFailedEvent): void {
	logDebug(
		{
			label: "Suite failed",
			labelColour: "#b91c1c",
			message: event.suite.name,
		},
		{ event },
	)
}
