import { ExplorerApp } from "+explorer/ExplorerApp"
import type { Project } from "+models/Project"
import { renderToStringAsync } from "preact-render-to-string"

export async function renderBodyHtml(
	initialProject: Project,
	_requestUrl: string,
): Promise<string> {
	return renderToStringAsync(
		<ExplorerApp initialProject={initialProject} initialTheme={null} />,
	)
}

export function renderInitialProject(initialProject: Project): string {
	// language=html
	return `<script type="text/javascript">window.__VITUS_INITIAL_PROJECT__=${JSON.stringify(initialProject)}</script>`
}
