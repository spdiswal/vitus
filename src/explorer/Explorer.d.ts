import type { InitialStateDto } from "+api/models/InitialStateDto"
import type { SelectableTheme } from "+explorer/theme/Theme"

declare global {
	interface Window {
		__VITUS_INITIAL_STATE__: InitialStateDto
		__VITUS_INITIAL_THEME__: SelectableTheme
	}
}
