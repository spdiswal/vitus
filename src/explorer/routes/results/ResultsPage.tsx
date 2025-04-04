import { getFileById } from "+explorer/models/File"
import { useRootPath } from "+explorer/models/RootPath"
import { getSubtaskById } from "+explorer/models/Subtask"
import { Breadcrumbs } from "+explorer/routes/results/Breadcrumbs"
import { DiffLegend } from "+explorer/routes/results/DiffLegend"
import type { Renderable } from "+types/Renderable"
import { assertNotNullish } from "+utilities/Assertions"
import { useSignalEffect } from "@preact/signals"
import { useParams } from "wouter-preact"

export function ResultsPage(): Renderable {
	const rootPath = useRootPath()

	const params = useParams()
	const taskId = params["*"]
	assertNotNullish(taskId)

	const subtask = getSubtaskById(taskId)
	const file = getFileById(subtask?.parentFileId ?? taskId)
	assertNotNullish(file)

	useSignalEffect(() => {
		document.title = `${file.name.value} – Vitest – Vitus`
	})

	if (subtask === null) {
		return null
	}

	return (
		<main class="flex flex-col transition">
			<Breadcrumbs
				filePath={file.path.value.substring(rootPath.value.length + 1)}
				subtaskNames={subtask.fullName.value}
			/>
			<h1 class="p-5 text-2xl font-mono font-bold rounded-tl-2xl border-b border-gray-400 dark:border-gray-700 transition">
				AssertionError: expected 29 to be 42
			</h1>
			<div class="group grow relative p-5 text-xl font-mono flex flex-col rounded-bl-2xl transition">
				<span class="">&nbsp;&nbsp;[object Object]</span>
				<span class="text-green-600 dark:text-green-500 transition">- 42</span>
				<span class="text-rose-600 dark:text-rose-500 transition">+ 29</span>
				<DiffLegend class="absolute z-10 p-5 top-0 right-0" />
			</div>
		</main>
	)
}
