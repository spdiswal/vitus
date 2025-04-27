import { NavigationTreeNode } from "+explorer/navigation/NavigationTreeNode"
import type { Module } from "+models/Module"
import type { Renderable } from "+types/Renderable"

export function NavigationTreeModuleNode(props: Module): Renderable {
	return (
		<NavigationTreeNode
			name={props.filename}
			status={props.status}
			suitesAndTests={props.suitesAndTests}
		/>
	)
}
