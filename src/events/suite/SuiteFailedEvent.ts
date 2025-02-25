import { getTopLevelSuiteById, putTopLevelSuite } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import type { SuitePath } from "+models/Suite"

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
	const [fileId, suiteId] = event.path
	const file = getFileById(project, fileId)

	if (file === null) {
		return project
	}

	const suite = getTopLevelSuiteById(file, suiteId)

	if (suite === null) {
		return project
	}

	return putFile(
		project,
		putTopLevelSuite(file, { ...suite, status: "failed" }),
	)
}
