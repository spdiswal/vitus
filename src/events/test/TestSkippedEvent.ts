import { getTopLevelTestById, putTopLevelTest } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import type { TestPath } from "+models/Test"
import type { Duration } from "+types/Duration"

export type TestSkippedEvent = {
	type: "test-skipped"
	duration: Duration
	path: TestPath
}

export function testSkippedEvent(
	props: Omit<TestSkippedEvent, "type">,
): TestSkippedEvent {
	return { type: "test-skipped", ...props }
}

export function applyTestSkippedEvent(
	project: Project,
	event: TestSkippedEvent,
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
		putTopLevelTest(file, {
			...test,
			duration: event.duration,
			status: "skipped",
		}),
	)
}
