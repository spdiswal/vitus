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

export function logTestSkippedEvent(
	project: Project,
	event: TestSkippedEvent,
): void {
	const { files, ...loggableProject } = project

	const file = getFileById(project, event.path[0])
	assertNotNullish(file)

	const test = getTestByPath(project, event.path)
	assertNotNullish(test)

	const { suitesAndTests, ...loggableFile } = file

	logDebug(
		{
			label: "Test skipped",
			labelColour: "#374151",
			message: `${file.filename} > ${event.path.length > 2 ? "... > " : ""}${test.name}`,
		},
		{ event, test, file: loggableFile, project: loggableProject },
	)
}
