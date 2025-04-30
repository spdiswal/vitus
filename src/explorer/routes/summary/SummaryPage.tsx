import { useProject } from "+explorer/project/UseProject"
import type { Renderable } from "+types/Renderable"
import { count } from "+utilities/Strings"
import { useEffect } from "preact/hooks"

export function SummaryPage(): Renderable {
	const project = useProject()
	const moduleCount = count(
		Object.keys(project.modulesById),
		"module",
		"modules",
	)

	useEffect(() => {
		document.title = `${moduleCount} – Vitest – Vitus`
	}, [])

	return (
		<main class="flex flex-col gap-y-5">
			<h1 class="pb-5 text-2xl font-bold border-b border-gray-400 dark:border-gray-700 transition">
				Vitest &ndash; Vitus
			</h1>
			<div class="font-mono">{project.rootPath}</div>
			<div>{moduleCount}</div>
		</main>
	)
}
