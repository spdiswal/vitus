import { type Project, getSuiteByPath, putSuite } from "+models/Project"
import { type SuitePath, newSuite } from "+models/Suite"

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
