import type { Project } from "+models/Project"
import {
	hasExistingParents,
	isExistingSubtask,
	putSubtask,
} from "+models/Subtask"
import type { Suite } from "+models/Suite"
import { logDebug } from "+utilities/Logging"

export type SuiteSkippedEvent = {
	type: "suite-skipped"
	suite: Suite
}

export function suiteSkippedEvent(suite: Suite): SuiteSkippedEvent {
	return { type: "suite-skipped", suite }
}

export function applySuiteSkippedEvent(
	project: Project,
	event: SuiteSkippedEvent,
): Project {
	return isExistingSubtask(project, event.suite) &&
		hasExistingParents(project, event.suite)
		? putSubtask(project, event.suite)
		: project
}

export function logSuiteSkippedEvent(event: SuiteSkippedEvent): void {
	logDebug(
		{
			label: "Suite skipped",
			labelColour: "#374151",
			message: event.suite.name,
		},
		{ event },
	)
}
