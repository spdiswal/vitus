import { NavigationTreeSection } from "+explorer/navigation/NavigationTreeSection"
import { type Files, hasFileStatus } from "+models/File"
import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function NavigationTree(props: {
	class?: ClassString
	files: Files
}): Renderable {
	return (
		<nav
			class={cn(
				"flex flex-col gap-y-10 bg-gray-200/50 dark:bg-gray-900/50 transition",
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
			<NavigationTreeSection
				files={props.files.filter(hasFileStatus("running"))}
			>
				Running
			</NavigationTreeSection>
			<NavigationTreeSection
				files={props.files.filter(hasFileStatus("failed"))}
			>
				Failed
			</NavigationTreeSection>
			<NavigationTreeSection
				files={props.files.filter(hasFileStatus("passed"))}
			>
				Passed
			</NavigationTreeSection>
			<NavigationTreeSection
				files={props.files.filter(hasFileStatus("skipped"))}
			>
				Skipped
			</NavigationTreeSection>
		</nav>
	)
}
