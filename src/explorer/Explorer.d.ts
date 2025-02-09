import type { ExplorerState } from "+explorer/state/ExplorerState"
import type { SelectableTheme } from "+explorer/theme/UseTheme"

declare global {
	interface Window {
		__VITUS_INITIAL_STATE__: ExplorerState
		__VITUS_INITIAL_THEME__: SelectableTheme
	}
}
