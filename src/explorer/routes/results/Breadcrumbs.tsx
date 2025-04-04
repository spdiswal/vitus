import { type ClassString, cn } from "+types/ClassString"
import type { NonEmptyArray } from "+types/NonEmptyArray"
import type { Renderable } from "+types/Renderable"

export function Breadcrumbs(props: {
	class?: ClassString
	filePath: string
	subtaskNames: NonEmptyArray<string>
}): Renderable {
	const directories = props.filePath.split("/")
	const filename = directories.pop()

	const parentNames = props.subtaskNames.slice(0, -1)
	const subtaskName = props.subtaskNames.at(-1) as string // `subtaskNames` is guaranteed to have at least one item.

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
				<span>{parentNames.join(" > ")}</span>
				{" > "}
				<span class="font-bold">{subtaskName}</span>
			</div>
		</div>
	)
}
