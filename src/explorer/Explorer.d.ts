import type { StateDto } from "+api/models/StateDto"
import type { SelectableTheme } from "+explorer/theme/Theme"

declare global {
	interface Window {
		__VITUS_INITIAL_STATE__: StateDto
		__VITUS_INITIAL_THEME__: SelectableTheme
	}
}
