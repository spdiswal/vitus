import { newFile } from "+models/File"
import { type Project, newProject } from "+models/Project"

export type RunCompletedEvent = {
	type: "run-completed"
}

export function runCompletedEvent(): RunCompletedEvent {
	return { type: "run-completed" }
}

export function applyRunCompletedEvent(project: Project): Project {
	return newProject({
		...project,
		files: project.files
			.filter((file) => file.status !== "running")
			.map((file) =>
				newFile({
					...file,
					tests: file.tests.filter((test) => test.status !== "running"),
				}),
			),
	})
}
