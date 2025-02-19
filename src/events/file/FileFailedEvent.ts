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
	const file = getFileById(project, event.id)

	if (file === null) {
		return project
	}

	return putFile(
		project,
		newFile({
			...file,
			duration: event.duration,
			status: "failed",
		}),
	)
}
