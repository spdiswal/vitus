import {
	type Project,
	getFileById,
	getTestByPath,
	putTest,
} from "+models/Project"
import { newTest } from "+models/Test"
import type { TestPath } from "+models/TestPath"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

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

export function logTestStartedEvent(
	project: Project,
	event: TestStartedEvent,
): void {
	const { files, ...loggableProject } = project

	const file = getFileById(project, event.path[0])
	assertNotNullish(file)

	const test = getTestByPath(project, event.path)
	assertNotNullish(test)

	const { suitesAndTests, ...loggableFile } = file

	logDebug(
		{
			label: "Test started",
			labelColour: "#b45309",
			message: `${file.filename} > ${event.path.length > 2 ? "... > " : ""}${test.name}`,
		},
		{ event, test, file: loggableFile, project: loggableProject },
	)
}
