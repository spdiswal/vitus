import { NavigationTreeNode } from "+explorer/navigation/NavigationTreeNode"
import type { Suite } from "+models/Suite"
import type { Renderable } from "+types/Renderable"

export function NavigationTreeSuiteNode(props: Suite): Renderable {
	return (
		<NavigationTreeNode
			duration={props.duration}
			name={props.name}
			status={props.status}
			suitesAndTests={props.suitesAndTests}
		/>
	)
}
