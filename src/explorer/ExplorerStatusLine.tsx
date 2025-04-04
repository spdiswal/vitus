import { useRootStatus } from "+explorer/models/RootStatus"
import { type ClassString, cn, cx } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function ExplorerStatusLine(props: {
	class?: ClassString
}): Renderable {
	const rootStatus = useRootStatus()

	return (
		<div
			class={cn(
				"h-2 transition",
				cx(rootStatus.value)({
					disconnected: "hidden",
					failed: "bg-rose-700",
					passed: "bg-green-700",
					skipped: "bg-gray-700",
					started: "bg-amber-500 animate-pulse",
				}),
				props.class,
			)}
		/>
	)
}
