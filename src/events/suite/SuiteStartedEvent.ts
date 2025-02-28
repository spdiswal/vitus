import { getTopLevelSuiteById, putTopLevelSuiteOrTest } from "+models/File"
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
	const [fileId, suiteId] = event.path
	const file = getFileById(project, fileId)

	if (file === null) {
		return project
	}

	const suite = getTopLevelSuiteById(file, suiteId)

	return putFile(
		project,
		putTopLevelSuiteOrTest(
			file,
			newSuite({
				name: event.name,
				path: event.path,
				status: "running",
				children: suite?.children ?? [],
			}),
		),
	)
}
