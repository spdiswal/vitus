import { ExplorerApp } from "+explorer/ExplorerApp"
import { hydrate } from "preact"
import "+explorer/Explorer.css"

const initialState = window.__VITUS_INITIAL_STATE__
hydrate(<ExplorerApp initialState={initialState} />, document.body)
