import { ChevronRightIcon } from "+explorer/icons/ChevronRightIcon"
import type { NavigationNodeStatus } from "+explorer/navigation/NavigationNodeStatus"
import { type ClassString, cn, cx } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function NavigationChevron(props: {
	class?: ClassString
	status: NavigationNodeStatus
	expanded: boolean
}): Renderable {
	return (
		<ChevronRightIcon
			class={cn(
				"size-4 transition",
				props.expanded ? "rotate-90 translate-y-px" : "rotate-0 translate-x-px",
				cx(props.status)({
					commenced: "text-amber-500 animate-pulse",
					failed: "text-rose-500",
					passed: "text-green-500",
					skipped: "text-gray-500",
				}),
				props.class,
			)}
			stroke-width="3"
		/>
	)
}
