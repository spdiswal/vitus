import { useSubtasks } from "+explorer/UseSubtasks"
import { NavigationTreeNode } from "+explorer/navigation/NavigationTreeNode"
import { NavigationTreeSuiteNode } from "+explorer/navigation/NavigationTreeSuiteNode"
import { NavigationTreeTestNode } from "+explorer/navigation/NavigationTreeTestNode"
import type { Module } from "+models/Module"
import type { Renderable } from "+types/Renderable"
import { useMemo } from "preact/hooks"

export function NavigationTreeModuleNode(props: {
	module: Module
}): Renderable {
	const subtasks = useSubtasks(props.module.id)
	const memoisedSubtaskNodes = useMemo(
		() =>
			subtasks.map((subtask) =>
				subtask.type === "suite" ? (
					<NavigationTreeSuiteNode key={subtask.id} suite={subtask} />
				) : (
					<NavigationTreeTestNode key={subtask.id} test={subtask} />
				),
			),
		[subtasks],
	)

	return (
		<NavigationTreeNode
			label={props.module.filename}
			status={props.module.status}
		>
			{memoisedSubtaskNodes}
		</NavigationTreeNode>
	)
}
