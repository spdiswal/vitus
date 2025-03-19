import { NavigationTreeNode } from "+explorer/navigation/NavigationTreeNode"
import type { File } from "+models/File"
import type { Renderable } from "+types/Renderable"

export function NavigationTreeFileNode(props: File): Renderable {
	return (
		<NavigationTreeNode
			duration={props.duration}
			name={props.filename}
			status={props.status}
			suitesAndTests={props.suitesAndTests}
		/>
	)
}
