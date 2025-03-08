import { dropUnfinishedFileChildren, hasNotFileStatus } from "+models/File"
import { type Project, newProject } from "+models/Project"
import { logDebug } from "+utilities/Logging"

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
			.filter(hasNotFileStatus("running"))
			.map(dropUnfinishedFileChildren),
	})
}

export function logRunCompletedEvent(
	project: Project,
	event: RunCompletedEvent,
): void {
	const { files, ...loggableProject } = project

	logDebug(
		{
			label: "Run completed",
			labelColour: "#1d4ed8",
			message: `Project ${project.status}`,
		},
		{ event, project: loggableProject },
	)
}
