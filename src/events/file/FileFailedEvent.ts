import { type FileId, newFile } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import type { Duration } from "+types/Duration"

export type FileFailedEvent = {
	type: "file-failed"
	duration: Duration
	id: FileId
}

export function fileFailedEvent(
	props: Omit<FileFailedEvent, "type">,
): FileFailedEvent {
	return { type: "file-failed", ...props }
}

export function applyFileFailedEvent(
	project: Project,
	event: FileFailedEvent,
): Project {
	const existingFile = getFileById(project, event.id)

	if (existingFile === null) {
		return project
	}

	const updatedFile = newFile({
		...existingFile,
		duration: event.duration,
		status: "failed",
	})

	return putFile(project, updatedFile)
}
