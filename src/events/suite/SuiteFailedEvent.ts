import { type Project, getSuiteByPath, putSuite } from "+models/Project"
import { type SuitePath, newSuite } from "+models/Suite"

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
