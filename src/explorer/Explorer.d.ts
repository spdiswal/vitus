import type { Project } from "+api/models/Project"
import type { SelectableTheme } from "+explorer/theme/Theme"

declare global {
	interface Window {
		__VITUS_INITIAL_PROJECT__: Project
		__VITUS_INITIAL_THEME__: SelectableTheme
	}
}
