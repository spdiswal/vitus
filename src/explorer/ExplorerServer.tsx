import { ExplorerApp } from "+explorer/ExplorerApp"
import type { ExplorerState } from "+explorer/state/ExplorerState"
import { renderToStringAsync } from "preact-render-to-string"

export async function renderBodyHtml(
	initialState: ExplorerState,
	_requestUrl: string,
): Promise<string> {
	return renderToStringAsync(
		<ExplorerApp initialState={initialState} initialTheme={null} />,
	)
}

export function renderInitialState(initialState: ExplorerState): string {
	// language=html
	return `<script type="text/javascript">window.__VITUS_INITIAL_STATE__=${JSON.stringify(initialState)}</script>`
}
