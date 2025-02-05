import type { ExplorerState } from "+explorer/state/ExplorerState"

declare global {
	interface Window {
		__VITUS_INITIAL_STATE__: ExplorerState
	}
}
