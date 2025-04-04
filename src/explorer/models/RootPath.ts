import type { Reactive } from "+types/Reactive"
import { signal } from "@preact/signals"

export type RootPath = string

export const rootPath: Reactive<RootPath> = signal("")

export function setRootPath(path: RootPath): void {
	rootPath.value = path
}
