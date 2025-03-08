import { type FileIds, newFile } from "+models/File"
import { type Project, newProject } from "+models/Project"
import { logDebug } from "+utilities/Logging"

export type RunStartedEvent = {
	type: "run-started"
	invalidatedFileIds: FileIds
}

export function runStartedEvent(
	props: Omit<RunStartedEvent, "type">,
): RunStartedEvent {
	return { type: "run-started", ...props }
}

export function applyRunStartedEvent(
	project: Project,
	event: RunStartedEvent,
): Project {
	return newProject({
		...project,
		files: project.files.map((file) =>
			event.invalidatedFileIds.includes(file.id)
				? newFile({ ...file, duration: 0, status: "running" })
				: file,
		),
	})
}

export function logRunStartedEvent(
	project: Project,
	event: RunStartedEvent,
): void {
	const { files, ...loggableProject } = project

	logDebug(
		{
			label: "Run started",
			labelColour: "#1d4ed8",
			message: `Project ${project.status}`,
		},
		{ event, project: loggableProject },
	)
}
