import type { NavigationNodeStatus } from "+explorer/navigation/NavigationNodeStatus"
import { type ClassString, cn, cx } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function NavigationDot(props: {
	class?: ClassString
	status: NavigationNodeStatus
}): Renderable {
	return (
		<span
			class={cn(
				"m-1 size-2 rounded-full",
				cx(props.status)({
					commenced: "bg-amber-500 animate-pulse",
					failed: "bg-rose-500",
					passed: "bg-green-500",
					skipped: "bg-gray-500",
				}),
				props.class,
			)}
		/>
	)
}
