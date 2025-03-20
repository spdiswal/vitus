import { ExplorerApp } from "+explorer/ExplorerApp"
import type { Project } from "+models/Project"
import { renderToStringAsync } from "preact-render-to-string"
import { Router } from "wouter-preact"

export async function renderBodyHtml(
	initialProject: Project,
	requestUrl: string,
): Promise<string> {
	return renderToStringAsync(
		<Router ssrPath={requestUrl}>
			<ExplorerApp initialProject={initialProject} initialTheme={null} />
		</Router>,
	)
}

export function renderInitialProject(initialProject: Project): string {
	// language=html
	return `<script type="text/javascript">window.__VITUS_INITIAL_PROJECT__=${JSON.stringify(initialProject)}</script>`
}
