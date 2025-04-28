import type { Project } from "+models/Project"
import {
	hasExistingParents,
	isExistingSubtask,
	putSubtask,
} from "+models/Subtask"
import type { Suite } from "+models/Suite"
import { logDebug } from "+utilities/Logging"

export type SuitePassedEvent = {
	type: "suite-passed"
	suite: Suite
}

export function suitePassedEvent(suite: Suite): SuitePassedEvent {
	return { type: "suite-passed", suite }
}

export function applySuitePassedEvent(
	project: Project,
	event: SuitePassedEvent,
): Project {
	return isExistingSubtask(project, event.suite) &&
		hasExistingParents(project, event.suite)
		? putSubtask(project, event.suite)
		: project
}

export function logSuitePassedEvent(event: SuitePassedEvent): void {
	logDebug(
		{
			label: "Suite passed",
			labelColour: "#15803d",
			message: event.suite.name,
		},
		{ event },
	)
}
