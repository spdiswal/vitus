import type { SelectableTheme } from "+explorer/theme/Theme"
import type { Project } from "+models/Project"

declare global {
	interface Window {
		__VITUS_INITIAL_PROJECT__: Project
		__VITUS_INITIAL_THEME__: SelectableTheme
	}
}
