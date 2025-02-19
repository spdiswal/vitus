import { type FileId, newFile } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import type { Duration } from "+types/Duration"

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
	const file = getFileById(project, event.id)

	if (file === null) {
		return project
	}

	return putFile(
		project,
		newFile({
			...file,
			duration: event.duration,
			status: "passed",
		}),
	)
}
