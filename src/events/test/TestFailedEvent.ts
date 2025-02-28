import { getTopLevelTestById, putTopLevelSuiteOrTest } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import type { TestPath } from "+models/Test"
import type { Duration } from "+types/Duration"

export type TestFailedEvent = {
	type: "test-failed"
	duration: Duration
	path: TestPath
}

export function testFailedEvent(
	props: Omit<TestFailedEvent, "type">,
): TestFailedEvent {
	return { type: "test-failed", ...props }
}

export function applyTestFailedEvent(
	project: Project,
	event: TestFailedEvent,
): Project {
	const [fileId, testId] = event.path
	const file = getFileById(project, fileId)

	if (file === null) {
		return project
	}

	const test = getTopLevelTestById(file, testId)

	if (test === null) {
		return project
	}

	return putFile(
		project,
		putTopLevelSuiteOrTest(file, {
			...test,
			duration: event.duration,
			status: "failed",
		}),
	)
}
