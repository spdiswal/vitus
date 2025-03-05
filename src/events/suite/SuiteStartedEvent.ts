import { type Project, getSuiteByPath, putSuite } from "+models/Project"
import { type SuitePath, newSuite } from "+models/Suite"

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
		children: existingSuite?.children ?? [],
	})

	return putSuite(project, updatedSuite)
}
