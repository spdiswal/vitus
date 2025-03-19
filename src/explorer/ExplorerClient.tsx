import { ExplorerApp } from "+explorer/ExplorerApp"
import { hydrate } from "preact"
import "+explorer/Explorer.css"
import { Router } from "wouter-preact"

const initialProject = window.__VITUS_INITIAL_PROJECT__
const initialTheme = window.__VITUS_INITIAL_THEME__

hydrate(
	<Router>
		<ExplorerApp initialProject={initialProject} initialTheme={initialTheme} />
	</Router>,
	document.body,
)
