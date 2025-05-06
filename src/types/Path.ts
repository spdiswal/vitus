import type { Module } from "+api/models/Module"

export type Path = string

export function getFilenameFromPath(path: Path): string {
	return path.slice(path.lastIndexOf("/") + 1)
}

export function byPath(path: Path): (module: Module) => boolean {
	return (module): boolean => module.path === path
}
