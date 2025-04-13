import {
	type Project,
	getModuleById,
	getSuiteByPath,
	putSuite,
} from "+models/Project"
import { newSuite } from "+models/Suite"
import type { SuitePath } from "+models/SuitePath"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

export type SuiteSkippedEvent = {
	type: "suite-skipped"
	path: SuitePath
}

export function suiteSkippedEvent(
	props: Omit<SuiteSkippedEvent, "type">,
): SuiteSkippedEvent {
	return { type: "suite-skipped", ...props }
}

export function applySuiteSkippedEvent(
	project: Project,
	event: SuiteSkippedEvent,
): Project {
	const existingSuite = getSuiteByPath(project, event.path)

	if (existingSuite === null) {
		return project
	}

	const updatedSuite = newSuite({ ...existingSuite, status: "skipped" })
	return putSuite(project, updatedSuite)
}

export function logSuiteSkippedEvent(
	project: Project,
	event: SuiteSkippedEvent,
): void {
	const { modules, ...loggableProject } = project

	const module = getModuleById(project, event.path[0])
	assertNotNullish(module)

	const suite = getSuiteByPath(project, event.path)
	assertNotNullish(suite)

	const { suitesAndTests, ...loggableModule } = module
	const { suitesAndTests: _suitesAndTests, ...loggableSuite } = suite

	logDebug(
		{
			label: "Suite skipped",
			labelColour: "#374151",
			message: `${module.filename} > ${event.path.length > 2 ? "... > " : ""}${suite.name}`,
		},
		{
			event,
			suite: loggableSuite,
			module: loggableModule,
			project: loggableProject,
		},
	)
}
