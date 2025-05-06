import type { Module } from "+api/models/Module"
import { NavigationTreeNode } from "+explorer/navigation/NavigationTreeNode"
import { NavigationTreeSuiteNode } from "+explorer/navigation/NavigationTreeSuiteNode"
import { NavigationTreeTestNode } from "+explorer/navigation/NavigationTreeTestNode"
import { useSubtasks } from "+explorer/project/UseSubtasks"
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
