import { NavigationTreeNode } from "+explorer/navigation/NavigationTreeNode"
import type { Files } from "+models/File"
import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"
import { count } from "+utilities/Strings"

export function NavigationTreeSection(props: {
	class?: ClassString
	files: Files
	children: Renderable
}): Renderable {
	return (
		<section
			class={cn(
				"flex flex-col gap-y-2",
				props.files.length === 0 && "hidden",
				props.class,
			)}
		>
			<h2 class="flex justify-between items-center pl-10 pb-1 border-b border-gray-400 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-light text-sm transition">
				<span class="uppercase tracking-wide">{props.children}</span>{" "}
				<span>
					{count(42 /* TODO: Count tests */, "test", "tests")} in{" "}
					{count(props.files, "file", "files")}
				</span>
			</h2>
			<ul class="pl-2 flex flex-col">
				{props.files.map((file) => (
					<NavigationTreeNode
						key={file.id}
						duration={file.duration}
						name={file.filename}
						status={file.status}
						suitesAndTests={file.suitesAndTests}
					/>
				))}
			</ul>
		</section>
	)
}
