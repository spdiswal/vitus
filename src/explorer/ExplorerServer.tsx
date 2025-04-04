import type { InitialStateDto } from "+api/models/InitialStateDto"
import { ExplorerApp } from "+explorer/ExplorerApp"
import { initialiseState } from "+explorer/models/InitialState"
import { renderToStringAsync } from "preact-render-to-string"
import { Router } from "wouter-preact"

export async function renderBodyHtml(
	initialStateDto: InitialStateDto,
	requestUrl: string,
): Promise<string> {
	initialiseState(initialStateDto)

	return renderToStringAsync(
		<Router ssrPath={requestUrl}>
			<ExplorerApp initialTheme={null} />
		</Router>,
	)
}

export function renderInitialState(state: InitialStateDto): string {
	// language=html
	return `<script type="text/javascript">window.__VITUS_INITIAL_STATE__=${JSON.stringify(state)}</script>`
}
