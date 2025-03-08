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

export function logTestPassedEvent(
	project: Project,
	event: TestPassedEvent,
): void {
	const { files, ...loggableProject } = project

	const file = getFileById(project, event.path[0])
	assertNotNullish(file)

	const test = getTestByPath(project, event.path)
	assertNotNullish(test)

	const { suitesAndTests, ...loggableFile } = file

	logDebug(
		{
			label: "Test passed",
			labelColour: "#15803d",
			message: `${file.filename} > ${event.path.length > 2 ? "... > " : ""}${test.name}`,
		},
		{ event, test, file: loggableFile, project: loggableProject },
	)
}
