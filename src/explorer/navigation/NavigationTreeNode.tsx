import type { TaskStatus } from "+api/models/TaskStatus"
import { ChevronRightIcon } from "+explorer/icons/ChevronRightIcon"
import { cn, cx } from "+types/ClassString"
import { formatDuration } from "+types/Duration"
import type { Renderable } from "+types/Renderable"
import { useState } from "preact/hooks"

export function NavigationTreeNode(props: {
	label: string
	status: TaskStatus
	children?: Renderable
}): Renderable {
	const [expanded, setExpanded] = useState(false)

	return (
		<li class="pt-1 flex flex-col">
			<button
				type="button"
				class={cn(
					"flex justify-start items-center text-start gap-x-2 px-2 py-1.5 rounded-md outline-none hocus:ring-1 active:hocus:ring-2 transition cursor-pointer",
					cx(props.status.type)({
						failed:
							"text-rose-500 ring-rose-500 hocus:bg-rose-100 dark:ring-rose-700 dark:hocus:bg-rose-950",
						passed:
							"text-green-500 ring-green-500 hocus:bg-green-100 dark:ring-green-700 dark:hocus:bg-green-950",
						skipped:
							"text-gray-400 ring-gray-400 hocus:bg-gray-200 dark:ring-gray-600 dark:hocus:bg-gray-800",
						started:
							"text-amber-500 ring-amber-500 hocus:bg-amber-100 dark:ring-amber-700 dark:hocus:bg-amber-950",
					}),
				)}
				onClick={(): void => setExpanded(!expanded)}
			>
				<ChevronRightIcon
					class={cn(
						"shrink-0 size-4 transition",
						expanded ? "rotate-90 translate-y-px" : "rotate-0 translate-x-px",
						props.status.type === "started" && "animate-pulse",
					)}
					stroke-width="3"
				/>
				<span class="text-gray-950 dark:text-gray-50 transition">
					{props.label}
					{props.status.type === "failed" || props.status.type === "passed" ? (
						<span class="ml-2 text-xs/1 font-light text-gray-500 whitespace-nowrap">
							in {formatDuration(props.status.duration)}
						</span>
					) : null}
				</span>
			</button>
			<ul
				class={cn(
					"flex flex-col ml-3.5 pl-2.5 border-l border-gray-400 dark:border-gray-700 transition",
					!expanded && "hidden",
				)}
			>
				{props.children}
			</ul>
		</li>
	)
}
