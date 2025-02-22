import { putTopLevelTest } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import { type TestPath, newTest } from "+models/Test"

export type TestStartedEvent = {
	type: "test-started"
	name: string
	path: TestPath
}

export function testStartedEvent(
	props: Omit<TestStartedEvent, "type">,
): TestStartedEvent {
	return { type: "test-started", ...props }
}

export function applyTestStartedEvent(
	project: Project,
	event: TestStartedEvent,
): Project {
	const [fileId] = event.path
	const file = getFileById(project, fileId)

	if (file === null) {
		return project
	}

	return putFile(
		project,
		putTopLevelTest(
			file,
			newTest({
				duration: 0,
				name: event.name,
				path: event.path,
				status: "running",
			}),
		),
	)
}
