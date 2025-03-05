import { type Project, getTestByPath, putTest } from "+models/Project"
import { type TestPath, newTest } from "+models/Test"
import type { Duration } from "+types/Duration"

export type TestPassedEvent = {
	type: "test-passed"
	duration: Duration
	path: TestPath
}

export function testPassedEvent(
	props: Omit<TestPassedEvent, "type">,
): TestPassedEvent {
	return { type: "test-passed", ...props }
}

export function applyTestPassedEvent(
	project: Project,
	event: TestPassedEvent,
): Project {
	const existingTest = getTestByPath(project, event.path)

	if (existingTest === null) {
		return project
	}

	const updatedTest = newTest({
		...existingTest,
		duration: event.duration,
		status: "passed",
	})

	return putTest(project, updatedTest)
}
