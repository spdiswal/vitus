import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function DiffLegend(props: {
	class?: ClassString
}): Renderable {
	return (
		<aside
			class={cn("flex gap-x-2 text-sm leading-none font-sans", props.class)}
		>
			<span class="text-green-600 dark:text-green-500 transition">
				- expected
			</span>
			<span class="text-rose-600 dark:text-rose-500 transition">+ actual</span>
		</aside>
	)
}
