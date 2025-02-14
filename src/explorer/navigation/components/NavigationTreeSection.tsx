import type { NavigationEntries } from "+explorer/navigation/NavigationEntry"
import { NavigationTreeNodes } from "+explorer/navigation/components/NavigationTreeNodes"
import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"
import { count } from "+utilities/Strings"

export function NavigationTreeSection(props: {
	class?: ClassString
	entries: NavigationEntries
	children: Renderable
}): Renderable {
	return (
		<section
			class={cn(
				"flex flex-col gap-y-2",
				props.entries.length === 0 && "hidden",
				props.class,
			)}
		>
			<h2 class="flex justify-between items-center pl-10 pb-1 border-b border-gray-400 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-light text-sm transition">
				<span class="uppercase tracking-wide">{props.children}</span>{" "}
				<span>
					{count(42 /* TODO: Count tests */, "test", "tests")} in{" "}
					{count(props.entries, "file", "files")}
				</span>
			</h2>
			<ul class="pl-2 flex flex-col">
				<NavigationTreeNodes entries={props.entries} />
			</ul>
		</section>
	)
}
