import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function Breadcrumbs(props: {
	class?: ClassString
	filePath: string
	suiteNames: Array<string>
	testName: string
}): Renderable {
	const directories = props.filePath.split("/")
	const filename = directories.pop()

	return (
		<div
			class={cn(
				"pb-5 flex flex-col gap-y-3 text-gray-800 dark:text-gray-200 transition",
				props.class,
			)}
		>
			<div>
				<span>{directories.join(" / ")}</span>
				{" / "}
				<span class="font-bold">{filename}</span>
			</div>
			<div>
				<span>{props.suiteNames.join(" > ")}</span>
				{" > "}
				<span class="font-bold">{props.testName}</span>
			</div>
		</div>
	)
}
