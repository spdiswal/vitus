import type { Subtask } from "+api/models/Subtask"
import { useParentSuiteNames } from "+explorer/project/UseParentSuiteNames"
import type { Renderable } from "+types/Renderable"

export function SubtaskBreadcrumbs(props: {
	subtask: Subtask
}): Renderable {
	const parentSuiteNames = useParentSuiteNames(props.subtask)

	return (
		<div>
			{parentSuiteNames.map((suiteName, index) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: The array index is a stable key, as the order of name segments is immutable.
					key={index}
					class="after:px-1 after:content-['>']"
				>
					{suiteName}
				</span>
			))}
			<span class="font-bold">{props.subtask.name}</span>
		</div>
	)
}
