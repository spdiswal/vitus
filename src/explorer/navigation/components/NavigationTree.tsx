import {
	type NavigationEntries,
	isCommenced,
	isFailed,
	isPassed,
	isSkipped,
	withoutPath,
} from "+explorer/navigation/NavigationEntry"
import { NavigationTreeSection } from "+explorer/navigation/components/NavigationTreeSection"
import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function NavigationTree(props: {
	class?: ClassString
	entries: NavigationEntries
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
				entries={props.entries.map(withoutPath).filter(isCommenced)}
			>
				Running
			</NavigationTreeSection>
			<NavigationTreeSection
				entries={props.entries.map(withoutPath).filter(isFailed)}
			>
				Failed
			</NavigationTreeSection>
			<NavigationTreeSection
				entries={props.entries.map(withoutPath).filter(isPassed)}
			>
				Passed
			</NavigationTreeSection>
			<NavigationTreeSection
				entries={props.entries.map(withoutPath).filter(isSkipped)}
			>
				Skipped
			</NavigationTreeSection>
		</nav>
	)
}
