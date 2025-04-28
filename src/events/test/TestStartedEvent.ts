import type { Project } from "+models/Project"
import { hasExistingParents, putSubtask } from "+models/Subtask"
import type { Test } from "+models/Test"
import { logDebug } from "+utilities/Logging"

export type TestStartedEvent = {
	type: "test-started"
	test: Test
}

export function testStartedEvent(test: Test): TestStartedEvent {
	return { type: "test-started", test }
}

export function applyTestStartedEvent(
	project: Project,
	event: TestStartedEvent,
): Project {
	return hasExistingParents(project, event.test)
		? putSubtask(project, event.test)
		: project
}

export function logTestStartedEvent(event: TestStartedEvent): void {
	logDebug(
		{
			label: "Test started",
			labelColour: "#b45309",
			message: event.test.name,
		},
		{ event },
	)
}
