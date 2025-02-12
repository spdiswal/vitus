import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function NavigationTreeSection(props: {
	class?: ClassString
	heading: string
	children?: Renderable
}): Renderable {
	return (
		<section class={cn("flex flex-col gap-y-2", props.class)}>
			<h2 class="pl-10 pb-1 border-b border-gray-400 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide transition">
				{props.heading}
			</h2>
			<ul class="pl-2 flex flex-col">{props.children}</ul>
		</section>
	)
}
