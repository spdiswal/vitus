import { useFiles } from "+explorer/models/File"
import { useRootPath } from "+explorer/models/RootPath"
import type { Renderable } from "+types/Renderable"
import { count } from "+utilities/Strings"
import { useSignalEffect } from "@preact/signals"

export function SummaryPage(): Renderable {
	const files = useFiles()
	const rootPath = useRootPath()

	useSignalEffect(() => {
		document.title = `${count(files.value, "file", "files")} – Vitest – Vitus`
	})

	return (
		<main class="flex flex-col gap-y-5">
			<h1 class="pb-5 text-2xl font-bold border-b border-gray-400 dark:border-gray-700 transition">
				Vitest &ndash; Vitus
			</h1>
			<div class="font-mono">{rootPath}</div>
			<div>{count(files.value, "file", "files")}</div>
		</main>
	)
}
