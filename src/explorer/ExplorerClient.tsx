import { ExplorerApp } from "+explorer/ExplorerApp"
import { hydrate } from "preact"
import "+explorer/Explorer.css"

const initialState = window.__VITUS_INITIAL_STATE__
const initialTheme = window.__VITUS_INITIAL_THEME__

hydrate(
	<ExplorerApp initialState={initialState} initialTheme={initialTheme} />,
	document.body,
)
