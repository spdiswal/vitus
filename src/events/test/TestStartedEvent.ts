import { type Project, putTest } from "+models/Project"
import { type TestPath, newTest } from "+models/Test"

export type TestStartedEvent = {
	type: "test-started"
	name: string
	path: TestPath
}

export function testStartedEvent(
	props: Omit<TestStartedEvent, "type">,
): TestStartedEvent {
	return { type: "test-started", ...props }
}

export function applyTestStartedEvent(
	project: Project,
	event: TestStartedEvent,
): Project {
	const updatedTest = newTest({
		duration: 0,
		name: event.name,
		path: event.path,
		status: "running",
	})

	return putTest(project, updatedTest)
}
