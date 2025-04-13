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

export type SuiteFailedEvent = {
	type: "suite-failed"
	path: SuitePath
}

export function suiteFailedEvent(
	props: Omit<SuiteFailedEvent, "type">,
): SuiteFailedEvent {
	return { type: "suite-failed", ...props }
}

export function applySuiteFailedEvent(
	project: Project,
	event: SuiteFailedEvent,
): Project {
	const existingSuite = getSuiteByPath(project, event.path)

	if (existingSuite === null) {
		return project
	}

	const updatedSuite = newSuite({ ...existingSuite, status: "failed" })
	return putSuite(project, updatedSuite)
}

export function logSuiteFailedEvent(
	project: Project,
	event: SuiteFailedEvent,
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
			label: "Suite failed",
			labelColour: "#b91c1c",
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
