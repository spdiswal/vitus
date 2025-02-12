import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function ExplorerStatusLine(props: {
	class?: ClassString
}): Renderable {
	return <div class={cn("h-2 bg-rose-500/50 backdrop-blur-md", props.class)} />
}
