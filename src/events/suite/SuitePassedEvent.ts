import { getTopLevelSuiteById, putTopLevelSuiteOrTest } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import type { SuitePath } from "+models/Suite"

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
		putTopLevelSuiteOrTest(file, { ...suite, status: "passed" }),
	)
}
