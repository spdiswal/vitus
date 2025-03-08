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

export type SuitePassedEvent = {
	type: "suite-passed"
	path: SuitePath
}

export function suitePassedEvent(
	props: Omit<SuitePassedEvent, "type">,
): SuitePassedEvent {
	return { type: "suite-passed", ...props }
}

export function applySuitePassedEvent(
	project: Project,
	event: SuitePassedEvent,
): Project {
	const existingSuite = getSuiteByPath(project, event.path)

	if (existingSuite === null) {
		return project
	}

	const updatedSuite = newSuite({ ...existingSuite, status: "passed" })
	return putSuite(project, updatedSuite)
}

export function logSuitePassedEvent(
	project: Project,
	event: SuitePassedEvent,
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
			label: "Suite passed",
			labelColour: "#15803d",
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
