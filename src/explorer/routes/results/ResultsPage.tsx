import { useModule } from "+explorer/models/Module"
import { useSubtask } from "+explorer/models/Subtask"
import { DiffLegend } from "+explorer/routes/results/DiffLegend"
import { ModuleBreadcrumbs } from "+explorer/routes/results/ModuleBreadcrumbs"
import { SubtaskBreadcrumbs } from "+explorer/routes/results/SubtaskBreadcrumbs"
import type { Renderable } from "+types/Renderable"
import { assertNotNullish } from "+utilities/Assertions"
import { useSignalEffect } from "@preact/signals"
import { useParams } from "wouter-preact"

export function ResultsPage(): Renderable {
	const params = useParams()
	const taskId = params["*"]
	assertNotNullish(taskId) // `ResultsPage` must only be rendered when the `*` parameter is present in the path.

	const subtask = useSubtask(taskId)
	const module = useModule(subtask.value?.moduleId ?? taskId)

	useSignalEffect(() => {
		if (module.value !== null) {
			document.title = `${module.value.name.value} – Vitest – Vitus`
		}
	})

	if (
		module.value === null ||
		subtask.value === null ||
		subtask.value.type !== "test"
	) {
		return null // TODO: 404 Not Found Page
	}

	return (
		<main class="flex flex-col transition">
			<div class="pb-5 flex flex-col gap-y-3 text-gray-800 dark:text-gray-200 transition">
				<ModuleBreadcrumbs moduleId={module.value.id} />
				<SubtaskBreadcrumbs subtaskId={subtask.value.id} />
			</div>
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
