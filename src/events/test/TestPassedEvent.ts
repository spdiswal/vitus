import type { Project } from "+models/Project"
import {
	hasExistingParents,
	isExistingSubtask,
	putSubtask,
} from "+models/Subtask"
import type { Test } from "+models/Test"
import { logDebug } from "+utilities/Logging"

export type TestPassedEvent = {
	type: "test-passed"
	test: Test
}

export function testPassedEvent(test: Test): TestPassedEvent {
	return { type: "test-passed", test }
}

export function applyTestPassedEvent(
	project: Project,
	event: TestPassedEvent,
): Project {
	return isExistingSubtask(project, event.test) &&
		hasExistingParents(project, event.test)
		? putSubtask(project, event.test)
		: project
}

export function logTestPassedEvent(event: TestPassedEvent): void {
	logDebug(
		{
			label: "Test passed",
			labelColour: "#15803d",
			message: event.test.name,
		},
		{ event },
	)
}
