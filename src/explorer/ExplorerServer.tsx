import { App } from "+explorer/App"
import { renderToStringAsync } from "preact-render-to-string"

export async function renderBodyHtml(_requestUrl: string): Promise<string> {
	return renderToStringAsync(<App />)
}
