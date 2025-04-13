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
	const { modules, ...loggableProject } = project

	const module = getModuleById(project, event.path[0])
	assertNotNullish(module)

	const suite = getSuiteByPath(project, event.path)
	assertNotNullish(suite)

	const { suitesAndTests, ...loggableModule } = module
	const { suitesAndTests: _suitesAndTests, ...loggableSuite } = suite

	logDebug(
		{
			label: "Suite passed",
			labelColour: "#15803d",
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
