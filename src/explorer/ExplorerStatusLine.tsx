import type { ProjectStatus } from "+models/Project"
import { type ClassString, cn, cx } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function ExplorerStatusLine(props: {
	class?: ClassString
	connected: boolean
	status: ProjectStatus
}): Renderable {
	return (
		<div
			class={cn(
				"h-2 transition",
				!props.connected && "hidden",
				cx(props.status)({
					failed: "bg-rose-700",
					passed: "bg-green-700",
					running: "bg-amber-500 animate-pulse",
				}),
				props.class,
			)}
		/>
	)
}
