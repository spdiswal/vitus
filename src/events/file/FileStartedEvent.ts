import { type FileId, newFile } from "+models/File"
import { type Project, getFileById, putFile } from "+models/Project"
import type { Path } from "+types/Path"

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
		children: existingFile?.children ?? [],
	})

	return putFile(project, updatedFile)
}
