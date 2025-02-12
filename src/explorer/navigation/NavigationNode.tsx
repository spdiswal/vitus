import { NavigationButton } from "+explorer/navigation/NavigationButton"
import { NavigationChevron } from "+explorer/navigation/NavigationChevron"
import { NavigationDot } from "+explorer/navigation/NavigationDot"
import type { NavigationNodeStatus } from "+explorer/navigation/NavigationNodeStatus"
import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"
import { useState } from "preact/hooks"

export function NavigationNode(props: {
	class?: ClassString
	name: string
	status: NavigationNodeStatus
	expandedInitially?: boolean
	selected?: boolean
	children?: Renderable
}): Renderable {
	const [expanded, setExpanded] = useState(props.expandedInitially ?? true)

	return (
		<li
			class={cn(
				"pt-1 flex flex-col transition",
				props.selected ? "text-inherit" : "text-gray-800 dark:text-gray-200",
				props.class,
			)}
		>
			<NavigationButton
				status={props.status}
				onClick={(): void => setExpanded(!expanded)}
			>
				{props.children !== undefined ? (
					<NavigationChevron
						class="shrink-0"
						status={props.status}
						expanded={expanded}
					/>
				) : (
					<NavigationDot class="shrink-0" status={props.status} />
				)}
				<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
					<span>{props.name}</span>
					<span class="text-xs text-gray-500 whitespace-nowrap">42 ms</span>
				</span>
			</NavigationButton>
			{props.children !== undefined ? (
				<ul
					class={cn(
						"flex flex-col ml-3.5 pl-2.5 border-l border-gray-400 dark:border-gray-700 transition",
						!expanded && "hidden",
					)}
				>
					{props.children}
				</ul>
			) : null}
		</li>
	)
}
