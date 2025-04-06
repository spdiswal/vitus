import { enumerateSubtaskAncestors, useSubtask } from "+explorer/models/Subtask"
import type { Renderable } from "+types/Renderable"
import type { TaskId } from "+types/TaskId"
import { concatIterables, filterIterable } from "+utilities/Iterables"
import { useComputed } from "@preact/signals"

export function SubtaskBreadcrumbs(props: {
	subtaskId: TaskId
}): Renderable {
	const subtask = useSubtask(props.subtaskId)
	const allSubtaskNames = useComputed(() => {
		if (subtask.value === null) {
			return null
		}

		const ancestors = enumerateSubtaskAncestors(subtask.value)
		return Array.from(
			concatIterables(
				filterIterable(ancestors, (ancestor) => ancestor.type === "suite"),
				[subtask.value],
			),
			(subtask) => subtask.name,
		)
	})

	return allSubtaskNames.value !== null ? (
		<div>
			{allSubtaskNames.value.map((segment, index) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: The array index is a stable key, as the order of path segments is immutable.
					key={index}
					class="last:font-bold after:content-[' > '] last:after:content-none"
				>
					{segment}
				</span>
			))}
		</div>
	) : null
}
