import { App } from "+explorer/App"
import { hydrate } from "preact"
import "+explorer/Explorer.css"

hydrate(<App />, document.body)
