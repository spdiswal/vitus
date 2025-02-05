import type { FileTree } from "+explorer/state/FileTree"

export type ExplorerState = {
	status: "completed" | "disconnected" | "started"
	fileTree: FileTree
}
