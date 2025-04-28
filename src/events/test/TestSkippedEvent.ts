import type { Project } from "+models/Project"
import {
	hasExistingParents,
	isExistingSubtask,
	putSubtask,
} from "+models/Subtask"
import type { Test } from "+models/Test"
import { logDebug } from "+utilities/Logging"

export type TestSkippedEvent = {
	type: "test-skipped"
	test: Test
}

export function testSkippedEvent(test: Test): TestSkippedEvent {
	return { type: "test-skipped", test }
}

export function applyTestSkippedEvent(
	project: Project,
	event: TestSkippedEvent,
): Project {
	return isExistingSubtask(project, event.test) &&
		hasExistingParents(project, event.test)
		? putSubtask(project, event.test)
		: project
}

export function logTestSkippedEvent(event: TestSkippedEvent): void {
	logDebug(
		{
			label: "Test skipped",
			labelColour: "#374151",
			message: event.test.name,
		},
		{ event },
	)
}
