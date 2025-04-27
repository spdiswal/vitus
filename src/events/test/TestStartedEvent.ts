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
	const { modules, ...loggableProject } = project

	const module = getModuleById(project, event.path[0])
	assertNotNullish(module)

	const test = getTestByPath(project, event.path)
	assertNotNullish(test)

	const { suitesAndTests, ...loggableModule } = module

	logDebug(
		{
			label: "Test started",
			labelColour: "#b45309",
			message: `${module.filename} > ${event.path.length > 2 ? "... > " : ""}${test.name}`,
		},
		{ event, test, module: loggableModule, project: loggableProject },
	)
}
