import { useProject } from "+explorer/UseProject"
import { DiffLegend } from "+explorer/routes/results/DiffLegend"
import { ModuleBreadcrumbs } from "+explorer/routes/results/ModuleBreadcrumbs"
import { SubtaskBreadcrumbs } from "+explorer/routes/results/SubtaskBreadcrumbs"
import { getModuleById } from "+models/Module"
import { getSubtaskById } from "+models/Subtask"
import type { TaskId } from "+models/TaskId"
import type { Renderable } from "+types/Renderable"
import { useEffect } from "preact/hooks"
import { useParams } from "wouter-preact"

export function ResultsPage(): Renderable {
	const project = useProject()

	const params = useParams()
	const taskId = params.taskId as TaskId

	const subtask = getSubtaskById(project, taskId)
	const module =
		subtask !== null ? getModuleById(project, subtask.parentModuleId) : null

	const filename = module?.filename ?? null

	useEffect(() => {
		if (filename !== null) {
			document.title = `${filename} – Vitest – Vitus`
		}
	}, [filename])

	if (subtask === null || module === null) {
		return null // TODO: 404 Not Found Page
	}

	return (
		<main class="flex flex-col transition">
			<div class="pb-5 flex flex-col gap-y-3 text-gray-800 dark:text-gray-200 transition">
				<ModuleBreadcrumbs module={module} />
				<SubtaskBreadcrumbs subtask={subtask} />
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
