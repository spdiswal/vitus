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

export type TestSkippedEvent = {
	type: "test-skipped"
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
		status: "skipped",
	})

	return putTest(project, updatedTest)
}

export function logTestSkippedEvent(
	project: Project,
	event: TestSkippedEvent,
): void {
	const { modules, ...loggableProject } = project

	const module = getModuleById(project, event.path[0])
	assertNotNullish(module)

	const test = getTestByPath(project, event.path)
	assertNotNullish(test)

	const { suitesAndTests, ...loggableModule } = module

	logDebug(
		{
			label: "Test skipped",
			labelColour: "#374151",
			message: `${module.filename} > ${event.path.length > 2 ? "... > " : ""}${test.name}`,
		},
		{ event, test, module: loggableModule, project: loggableProject },
	)
}
