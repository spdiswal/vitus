import { ExplorerApp } from "+explorer/ExplorerApp"
import { initialiseState } from "+explorer/models/InitialState"
import { hydrate } from "preact"
import { Router } from "wouter-preact"

const initialStateDto = window.__VITUS_INITIAL_STATE__
const initialTheme = window.__VITUS_INITIAL_THEME__

initialiseState(initialStateDto)

hydrate(
	<Router>
		<ExplorerApp initialTheme={initialTheme} />
	</Router>,
	document.body,
)
