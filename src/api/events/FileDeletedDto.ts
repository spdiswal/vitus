export type FileDeletedDto = {
	type: "file-deleted"
	path: string
}

export function fileDeleted(path: string): FileDeletedDto {
	return { type: "file-deleted", path }
}
