import type { FileTree } from "+explorer/state/FileTree"

export const initialExplorerState: ExplorerState = {
	status: "completed",
	fileTree: [],
}

export type ExplorerState = {
	status: "completed" | "disconnected" | "started"
	fileTree: FileTree
}
