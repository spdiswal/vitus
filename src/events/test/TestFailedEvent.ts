import {
	type Project,
	getFileById,
	getTestByPath,
	putTest,
} from "+models/Project"
import { newTest } from "+models/Test"
import type { TestPath } from "+models/TestPath"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

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

export function logTestFailedEvent(
	project: Project,
	event: TestFailedEvent,
): void {
	const { files, ...loggableProject } = project

	const file = getFileById(project, event.path[0])
	assertNotNullish(file)

	const test = getTestByPath(project, event.path)
	assertNotNullish(test)

	const { suitesAndTests, ...loggableFile } = file

	logDebug(
		{
			label: "Test failed",
			labelColour: "#b91c1c",
			message: `${file.filename} > ${event.path.length > 2 ? "... > " : ""}${test.name}`,
		},
		{ event, test, file: loggableFile, project: loggableProject },
	)
}
