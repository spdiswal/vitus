import { getTopLevelSuiteById, putTopLevelSuite } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import type { SuitePath } from "+models/Suite"

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
		putTopLevelSuite(file, { ...suite, status: "skipped" }),
	)
}
