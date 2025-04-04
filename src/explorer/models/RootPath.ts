import type { Computed, Reactive } from "+types/Reactive"
import { signal } from "@preact/signals"

export type RootPath = string

const rootPath: Reactive<RootPath> = signal("")

export function useRootPath(): Computed<RootPath> {
	return rootPath
}

export function setRootPath(path: RootPath): void {
	rootPath.value = path
}
