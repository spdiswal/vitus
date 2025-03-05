import { type Project, getTestByPath, putTest } from "+models/Project"
import { type TestPath, newTest } from "+models/Test"
import type { Duration } from "+types/Duration"

export type TestFailedEvent = {
	type: "test-failed"
	duration: Duration
	path: TestPath
}

export function testFailedEvent(
	props: Omit<TestFailedEvent, "type">,
): TestFailedEvent {
	return { type: "test-failed", ...props }
}

export function applyTestFailedEvent(
	project: Project,
	event: TestFailedEvent,
): Project {
	const existingTest = getTestByPath(project, event.path)

	if (existingTest === null) {
		return project
	}

	const updatedTest = newTest({
		...existingTest,
		duration: event.duration,
		status: "failed",
	})

	return putTest(project, updatedTest)
}
