import {
	type Project,
	getModuleById,
	getTestByPath,
	putTest,
} from "+models/Project"
import { newTest } from "+models/Test"
import type { TestPath } from "+models/TestPath"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

export type TestFailedEvent = {
	type: "test-failed"
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
		status: "failed",
	})

	return putTest(project, updatedTest)
}

export function logTestFailedEvent(
	project: Project,
	event: TestFailedEvent,
): void {
	const { modules, ...loggableProject } = project

	const module = getModuleById(project, event.path[0])
	assertNotNullish(module)

	const test = getTestByPath(project, event.path)
	assertNotNullish(test)

	const { suitesAndTests, ...loggableModule } = module

	logDebug(
		{
			label: "Test failed",
			labelColour: "#b91c1c",
			message: `${module.filename} > ${event.path.length > 2 ? "... > " : ""}${test.name}`,
		},
		{ event, test, module: loggableModule, project: loggableProject },
	)
}
