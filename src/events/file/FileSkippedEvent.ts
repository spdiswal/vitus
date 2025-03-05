import { type FileId, newFile } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import type { Duration } from "+types/Duration"

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
