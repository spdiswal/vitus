import type { Suite } from "+api/models/Suite"
import { NavigationTreeNode } from "+explorer/navigation/NavigationTreeNode"
import { NavigationTreeTestNode } from "+explorer/navigation/NavigationTreeTestNode"
import { useSubtasks } from "+explorer/project/UseSubtasks"
import type { Renderable } from "+types/Renderable"
import { useMemo } from "preact/hooks"

export function NavigationTreeSuiteNode(props: {
	suite: Suite
}): Renderable {
	const subtasks = useSubtasks(props.suite.id)
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
		<NavigationTreeNode label={props.suite.name} status={props.suite.status}>
			{memoisedSubtaskNodes}
		</NavigationTreeNode>
	)
}
