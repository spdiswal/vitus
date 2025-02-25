import { putTopLevelSuite } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
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
	const [fileId] = event.path
	const file = getFileById(project, fileId)

	if (file === null) {
		return project
	}

	return putFile(
		project,
		putTopLevelSuite(
			file,
			newSuite({
				name: event.name,
				path: event.path,
				status: "running",
			}),
		),
	)
}
