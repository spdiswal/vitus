import { ExplorerApp } from "+explorer/ExplorerApp"
import { hydrate } from "preact"
import "+explorer/Explorer.css"

const initialProject = window.__VITUS_INITIAL_PROJECT__
const initialTheme = window.__VITUS_INITIAL_THEME__

hydrate(
	<ExplorerApp initialProject={initialProject} initialTheme={initialTheme} />,
	document.body,
)
