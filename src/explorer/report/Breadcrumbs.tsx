import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function Breadcrumbs(props: {
	class?: ClassString
}): Renderable {
	return (
		<div
			class={cn(
				"p-5 flex flex-col gap-y-2 text-gray-800 dark:text-gray-200 transition",
				props.class,
			)}
		>
			<span>src / server / EventStreamReporter.tests.ts</span>
			<span>
				given a set of test files of $filePaths &gt; when a test run has started
				&gt; sends a 'run started' event
			</span>
		</div>
	)
}
