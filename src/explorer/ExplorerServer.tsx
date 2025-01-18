import { ExplorerApp } from "+explorer/ExplorerApp"
import { renderToStringAsync } from "preact-render-to-string"

export async function renderBodyHtml(_requestUrl: string): Promise<string> {
	return renderToStringAsync(<ExplorerApp />)
}
