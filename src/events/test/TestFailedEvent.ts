import type { Project } from "+models/Project"
import {
	hasExistingParents,
	isExistingSubtask,
	putSubtask,
} from "+models/Subtask"
import type { Test } from "+models/Test"
import { logDebug } from "+utilities/Logging"

export type TestFailedEvent = {
	type: "test-failed"
	test: Test
}

export function testFailedEvent(test: Test): TestFailedEvent {
	return { type: "test-failed", test }
}

export function applyTestFailedEvent(
	project: Project,
	event: TestFailedEvent,
): Project {
	return isExistingSubtask(project, event.test) &&
		hasExistingParents(project, event.test)
		? putSubtask(project, event.test)
		: project
}

export function logTestFailedEvent(event: TestFailedEvent): void {
	logDebug(
		{
			label: "Test failed",
			labelColour: "#b91c1c",
			message: event.test.name,
		},
		{ event },
	)
}
