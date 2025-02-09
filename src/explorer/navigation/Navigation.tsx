import { NavigationEntry } from "+explorer/navigation/NavigationEntry"
import { NavigationSection } from "+explorer/navigation/NavigationSection"
import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function Navigation(props: {
	class?: ClassString
}): Renderable {
	return (
		<nav
			class={cn(
				"pt-10 pr-10 flex flex-col gap-y-10 bg-gray-200/50 dark:bg-gray-900/50 transition",
				props.class,
			)}
		>
			<div class="pl-5">
				<input
					class="w-full outline-none bg-gray-200 dark:bg-gray-800 px-5 py-2 rounded-full transition"
					placeholder="Search"
				/>
			</div>
			<NavigationSection
				heading="Failed (10 tests)"
				class="text-rose-500 marker:text-rose-500"
			>
				<NavigationEntry>EventStreamReporter.tests.ts</NavigationEntry>
				<NavigationEntry>ExplorerApp.tests.tsx</NavigationEntry>
				<NavigationEntry>FileTree.tests.ts</NavigationEntry>
			</NavigationSection>
			<NavigationSection
				heading="Passed (1833 tests)"
				class="text-green-500 marker:text-green-500"
			>
				<NavigationEntry>EventStreamReporter.tests.ts</NavigationEntry>
				<NavigationEntry>ExplorerApp.tests.tsx</NavigationEntry>
				<NavigationEntry>FileTree.tests.ts</NavigationEntry>
			</NavigationSection>
			<NavigationSection
				heading="Skipped (2 tests)"
				class="text-gray-500 marker:text-gray-500"
			>
				<NavigationEntry>EventStreamReporter.tests.ts</NavigationEntry>
				<NavigationEntry>ExplorerApp.tests.tsx</NavigationEntry>
				<NavigationEntry>FileTree.tests.ts</NavigationEntry>
			</NavigationSection>
		</nav>
	)
}
