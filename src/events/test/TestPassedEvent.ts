import { getTopLevelTestById, putTopLevelSuiteOrTest } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import type { TestPath } from "+models/Test"
import type { Duration } from "+types/Duration"

export type TestPassedEvent = {
	type: "test-passed"
	duration: Duration
	path: TestPath
}

export function testPassedEvent(
	props: Omit<TestPassedEvent, "type">,
): TestPassedEvent {
	return { type: "test-passed", ...props }
}

export function applyTestPassedEvent(
	project: Project,
	event: TestPassedEvent,
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
			status: "passed",
		}),
	)
}
