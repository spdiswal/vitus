import type { Project } from "+models/Project"
import { hasExistingParents, putSubtask } from "+models/Subtask"
import type { Suite } from "+models/Suite"
import { logDebug } from "+utilities/Logging"

export type SuiteStartedEvent = {
	type: "suite-started"
	suite: Suite
}

export function suiteStartedEvent(suite: Suite): SuiteStartedEvent {
	return { type: "suite-started", suite }
}

export function applySuiteStartedEvent(
	project: Project,
	event: SuiteStartedEvent,
): Project {
	return hasExistingParents(project, event.suite)
		? putSubtask(project, event.suite)
		: project
}

export function logSuiteStartedEvent(event: SuiteStartedEvent): void {
	logDebug(
		{
			label: "Suite started",
			labelColour: "#b45309",
			message: event.suite.name,
		},
		{ event },
	)
}
