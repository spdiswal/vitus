import { type Project, newProject } from "+models/Project"
import type { Path } from "+types/Path"

export type FileDeletedEvent = {
	type: "file-deleted"
	path: Path
}

export function fileDeletedEvent(
	props: Omit<FileDeletedEvent, "type">,
): FileDeletedEvent {
	return { type: "file-deleted", ...props }
}

export function applyFileDeletedEvent(
	project: Project,
	event: FileDeletedEvent,
): Project {
	return newProject({
		...project,
		files: project.files.filter((file) => file.path !== event.path),
	})
}
