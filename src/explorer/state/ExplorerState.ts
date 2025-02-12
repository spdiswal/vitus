import {
	type FileTree,
	mapModuleToFileTree,
	mergeFileTrees,
} from "+explorer/state/FileTree"
import type { Vitest } from "vitest/node"

export type ExplorerState = {
	status: "completed" | "disconnected" | "started"
	fileTree: FileTree
}

export function getInitialState(vitest: Vitest): ExplorerState {
	const modules = vitest.state.getTestModules()

	const moduleStates = new Set(modules.map((module) => module.state()))
	const status =
		moduleStates.has("pending") || moduleStates.has("queued")
			? "started"
			: "completed"

	const fileTree = modules
		.map(mapModuleToFileTree)
		.reduce<FileTree>(mergeFileTrees, [])

	return { status, fileTree }
}
