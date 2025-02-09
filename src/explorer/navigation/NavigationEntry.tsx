import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function NavigationEntry(props: {
	class?: ClassString
	selected?: boolean
	children?: Renderable
}): Renderable {
	return (
		<li
			class={cn(
				"py-2 text-gray-800 dark:text-gray-200 data-selected:text-inherit cursor-pointer transition",
				"motion-safe:hover:translate-x-2 motion-reduce:hover:text-blue-500",
				props.class,
			)}
			data-selected={props.selected || undefined}
		>
			{props.children}
		</li>
	)
}
