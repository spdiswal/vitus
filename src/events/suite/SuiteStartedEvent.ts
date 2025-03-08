import {
	type Project,
	getFileById,
	getSuiteByPath,
	putSuite,
} from "+models/Project"
import { newSuite } from "+models/Suite"
import type { SuitePath } from "+models/SuitePath"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

export type SuiteStartedEvent = {
	type: "suite-started"
	name: string
	path: SuitePath
}

export function suiteStartedEvent(
	props: Omit<SuiteStartedEvent, "type">,
): SuiteStartedEvent {
	return { type: "suite-started", ...props }
}

export function applySuiteStartedEvent(
	project: Project,
	event: SuiteStartedEvent,
): Project {
	const existingSuite = getSuiteByPath(project, event.path)

	const updatedSuite = newSuite({
		name: event.name,
		path: event.path,
		status: "running",
		suitesAndTests: existingSuite?.suitesAndTests ?? [],
	})

	return putSuite(project, updatedSuite)
}

export function logSuiteStartedEvent(
	project: Project,
	event: SuiteStartedEvent,
): void {
	const { files, ...loggableProject } = project

	const file = getFileById(project, event.path[0])
	assertNotNullish(file)

	const suite = getSuiteByPath(project, event.path)
	assertNotNullish(suite)

	const { suitesAndTests, ...loggableFile } = file
	const { suitesAndTests: _suitesAndTests, ...loggableSuite } = suite

	logDebug(
		{
			label: "Suite started",
			labelColour: "#b45309",
			message: `${file.filename} > ${event.path.length > 2 ? "... > " : ""}${suite.name}`,
		},
		{
			event,
			suite: loggableSuite,
			file: loggableFile,
			project: loggableProject,
		},
	)
}
