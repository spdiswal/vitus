import { useProject } from "+explorer/UseProject"
import { type ClassString, cn, cx } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function ExplorerStatusLine(props: {
	class?: ClassString
}): Renderable {
	const project = useProject()

	return (
		<div
			class={cn(
				"h-2 transition",
				!project.isConnected && "hidden",
				cx(project.status)({
					failed: "bg-rose-700",
					passed: "bg-green-700",
					started: "bg-amber-500 animate-pulse",
				}),
				props.class,
			)}
		/>
	)
}
