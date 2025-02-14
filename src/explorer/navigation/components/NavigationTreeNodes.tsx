import type { NavigationEntries } from "+explorer/navigation/NavigationEntry"
import { NavigationTreeNode } from "+explorer/navigation/components/NavigationTreeNode"
import type { Renderable } from "+types/Renderable"

export function NavigationTreeNodes(props: {
	entries: NavigationEntries
}): Renderable {
	return props.entries.map((entry) => (
		<NavigationTreeNode key={entry.id} {...entry} />
	))
}
