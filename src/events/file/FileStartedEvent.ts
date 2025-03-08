import { type FileId, newFile } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import type { Path } from "+types/Path"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

export type FileStartedEvent = {
	type: "file-started"
	id: FileId
	path: Path
}

export function fileStartedEvent(
	props: Omit<FileStartedEvent, "type">,
): FileStartedEvent {
	return { type: "file-started", ...props }
}

export function applyFileStartedEvent(
	project: Project,
	event: FileStartedEvent,
): Project {
	const existingFile = getFileById(project, event.id)

	const updatedFile = newFile({
		id: event.id,
		duration: 0,
		path: event.path,
		status: "running",
		suitesAndTests: existingFile?.suitesAndTests ?? [],
	})

	return putFile(project, updatedFile)
}

export function logFileStartedEvent(
	project: Project,
	event: FileStartedEvent,
): void {
	const { files, ...loggableProject } = project

	const file = getFileById(project, event.id)
	assertNotNullish(file)

	const { suitesAndTests, ...loggableFile } = file

	logDebug(
		{
			label: "File started",
			labelColour: "#b45309",
			message: file.filename,
		},
		{ event, file: loggableFile, project: loggableProject },
	)
}
