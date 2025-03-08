import { type FileId, newFile } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

export type FileSkippedEvent = {
	type: "file-skipped"
	duration: Duration
	id: FileId
}

export function fileSkippedEvent(
	props: Omit<FileSkippedEvent, "type">,
): FileSkippedEvent {
	return { type: "file-skipped", ...props }
}

export function applyFileSkippedEvent(
	project: Project,
	event: FileSkippedEvent,
): Project {
	const existingFile = getFileById(project, event.id)

	if (existingFile === null) {
		return project
	}

	const updatedFile = newFile({
		...existingFile,
		duration: event.duration,
		status: "skipped",
	})

	return putFile(project, updatedFile)
}

export function logFileSkippedEvent(
	project: Project,
	event: FileSkippedEvent,
): void {
	const { files, ...loggableProject } = project

	const file = getFileById(project, event.id)
	assertNotNullish(file)

	const { suitesAndTests, ...loggableFile } = file

	logDebug(
		{
			label: "File skipped",
			labelColour: "#374151",
			message: file.filename,
		},
		{ event, file: loggableFile, project: loggableProject },
	)
}
