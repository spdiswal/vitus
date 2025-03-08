import { type Project, getFileByPath, newProject } from "+models/Project"
import type { Path } from "+types/Path"
import { assertNotNullish } from "+utilities/Assertions"
import { logDebug } from "+utilities/Logging"

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

export function logFileDeletedEvent(
	project: Project,
	event: FileDeletedEvent,
): void {
	const { files, ...loggableProject } = project

	const file = getFileByPath(project, event.path)
	assertNotNullish(file)

	const { suitesAndTests, ...loggableFile } = file

	logDebug(
		{
			label: "File deleted",
			labelColour: "#374151",
			message: file.filename,
		},
		{ event, file: loggableFile, project: loggableProject },
	)
}
