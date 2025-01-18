import { ExplorerApp } from "+explorer/ExplorerApp"
import { hydrate } from "preact"
import "+explorer/Explorer.css"

hydrate(<ExplorerApp />, document.body)
