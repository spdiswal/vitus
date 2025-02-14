import type { ExplorerOverallStatus } from "+explorer/state/ExplorerState"
import { type ClassString, cn, cx } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function ExplorerStatusLine(props: {
	class?: ClassString
	status: ExplorerOverallStatus
}): Renderable {
	return (
		<div
			class={cn(
				"h-2 transition",
				cx(props.status)({
					commenced: "bg-amber-500 animate-pulse",
					disconnected: "hidden",
					failed: "bg-rose-700",
					passed: "bg-green-700",
					skipped: "bg-gray-700",
				}),
				props.class,
			)}
		/>
	)
}
