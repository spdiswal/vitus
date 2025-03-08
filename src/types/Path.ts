export type Path = string

export function getFilenameFromPath(path: Path): string {
	return path.slice(path.lastIndexOf("/") + 1)
}
