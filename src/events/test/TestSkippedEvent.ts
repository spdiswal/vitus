import { type Project, getTestByPath, putTest } from "+models/Project"
import { type TestPath, newTest } from "+models/Test"
import type { Duration } from "+types/Duration"

export type TestSkippedEvent = {
	type: "test-skipped"
	duration: Duration
	path: TestPath
}

export function testSkippedEvent(
	props: Omit<TestSkippedEvent, "type">,
): TestSkippedEvent {
	return { type: "test-skipped", ...props }
}

export function applyTestSkippedEvent(
	project: Project,
	event: TestSkippedEvent,
): Project {
	const existingTest = getTestByPath(project, event.path)

	if (existingTest === null) {
		return project
	}

	const updatedTest = newTest({
		...existingTest,
		duration: event.duration,
		status: "skipped",
	})

	return putTest(project, updatedTest)
}
