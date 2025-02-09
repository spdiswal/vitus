import { DiffLegend } from "+explorer/report/DiffLegend"
import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function Report(props: {
	class?: ClassString
}): Renderable {
	return (
		<main class={cn("flex flex-col transition", props.class)}>
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
