import type { SelectableTheme } from "+explorer/theme/UseTheme"
import type { Project } from "+models/Project"

declare global {
	interface Window {
		__VITUS_INITIAL_PROJECT__: Project
		__VITUS_INITIAL_THEME__: SelectableTheme
	}
}
