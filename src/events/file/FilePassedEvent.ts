import { type FileId, newFile } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

export type FilePassedEvent = {
	type: "file-passed"
	duration: Duration
	id: FileId
}

export function filePassedEvent(
	props: Omit<FilePassedEvent, "type">,
): FilePassedEvent {
	return { type: "file-passed", ...props }
}

export function applyFilePassedEvent(
	project: Project,
	event: FilePassedEvent,
): Project {
	const existingFile = getFileById(project, event.id)

	if (existingFile === null) {
		return project
	}

	const updatedFile = newFile({
		...existingFile,
		duration: event.duration,
		status: "passed",
	})

	return putFile(project, updatedFile)
}

export function logFilePassedEvent(
	project: Project,
	event: FilePassedEvent,
): void {
	const { files, ...loggableProject } = project

	const file = getFileById(project, event.id)
	assertNotNullish(file)

	const { suitesAndTests, ...loggableFile } = file

	logDebug(
		{
			label: "File passed",
			labelColour: "#15803d",
			message: file.filename,
		},
		{ event, file: loggableFile, project: loggableProject },
	)
}
