import type { Computed, PickNonComputed } from "+types/Computed"
import type { Duration } from "+types/Duration"
import type { Path } from "+types/Path"

export type File = {
	id: FileId
	duration: Duration
	filename: Computed<string>
	path: Path
	status: FileStatus
}

export type Files = Array<File>

export type FileId = string
export type FileIds = Array<FileId>
export type FileStatus = "failed" | "passed" | "running" | "skipped"

export function newFile(props: PickNonComputed<File>): File {
	return {
		...props,
		filename: props.path.slice(props.path.lastIndexOf("/") + 1),
	}
}
