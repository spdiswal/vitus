import { useFiles } from "+explorer/models/File"
import { NavigationTreeNode } from "+explorer/navigation/NavigationTreeNode"
import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function NavigationTree(props: {
	class?: ClassString
}): Renderable {
	const files = useFiles()

	return (
		<nav
			class={cn(
				"flex flex-col gap-y-5 bg-gray-200/50 dark:bg-gray-900/50 transition",
				"overflow-y-auto [scrollbar-color:var(--color-gray-400)_var(--color-gray-200)] dark:[scrollbar-color:var(--color-gray-700)_var(--color-gray-900)]",
				props.class,
			)}
		>
			<div class="pl-5">
				<input
					class="w-full outline-none bg-gray-200 dark:bg-gray-800 px-5 py-2 rounded-full transition"
					placeholder="Search"
				/>
			</div>
			<ul class="pl-2 flex flex-col">
				{files.value.map((task) => (
					<NavigationTreeNode key={task.id} {...task} />
				))}
			</ul>
		</nav>
	)
}
