import { type Subtask, enumerateSubtaskAncestors } from "+api/models/Subtask"
import { useProject } from "+explorer/project/UseProject"
import type { Renderable } from "+types/Renderable"
import { concatIterables, filterIterable } from "+utilities/Iterables"

export function SubtaskBreadcrumbs(props: {
	subtask: Subtask
}): Renderable {
	const project = useProject()

	const ancestors = enumerateSubtaskAncestors(project, props.subtask)
	const allSubtaskNames = Array.from(
		concatIterables(
			filterIterable(ancestors, (ancestor) => ancestor.type === "suite"),
			[props.subtask],
		),
		(subtask) => subtask.name,
	)

	return (
		<div>
			{allSubtaskNames.map((segment, index) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: The array index is a stable key, as the order of path segments is immutable.
					key={index}
					class="last:font-bold after:px-1 after:content-['>'] last:after:content-none"
				>
					{segment}
				</span>
			))}
		</div>
	)
}
