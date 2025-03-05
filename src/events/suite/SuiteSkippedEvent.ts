import { type Project, getSuiteByPath, putSuite } from "+models/Project"
import { type SuitePath, newSuite } from "+models/Suite"

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
