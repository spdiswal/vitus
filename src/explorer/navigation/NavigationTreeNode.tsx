import { useSubtasks } from "+explorer/UseSubtasks"
import { ChevronRightIcon } from "+explorer/icons/ChevronRightIcon"
import type { Task } from "+explorer/models/Task"
import { cn, cx } from "+types/ClassString"
import { formatDuration } from "+types/Duration"
import type { Renderable } from "+types/Renderable"
import { useSignal } from "@preact/signals"
import { useLocation } from "wouter-preact"

export function NavigationTreeNode(props: Task): Renderable {
	const [location, navigate] = useLocation()

	const subtasks = useSubtasks(props)
	const isExpanded = useSignal(false)

	return (
		<li class="pt-1 flex flex-col">
			<button
				type="button"
				class={cn(
					"flex justify-start items-center text-start gap-x-2 px-2 py-1.5 rounded-md outline-none hocus:ring-1 active:hocus:ring-0 transition cursor-pointer",
					cx(props.status.value)({
						failed:
							"text-rose-500 ring-rose-500 hocus:bg-rose-100 dark:ring-rose-700 dark:hocus:bg-rose-950",
						passed:
							"text-green-500 ring-green-500 hocus:bg-green-100 dark:ring-green-700 dark:hocus:bg-green-950",
						queued:
							"text-amber-500 ring-amber-500 hocus:bg-amber-100 dark:ring-amber-700 dark:hocus:bg-amber-950",
						skipped:
							"text-gray-400 ring-gray-400 hocus:bg-gray-200 dark:ring-gray-600 dark:hocus:bg-gray-800",
						started:
							"text-amber-500 ring-amber-500 hocus:bg-amber-100 dark:ring-amber-700 dark:hocus:bg-amber-950",
					}),
				)}
				onClick={(): void => {
					const targetLocation = `/${props.id}`

					if (subtasks.peek().length > 0) {
						isExpanded.value = !isExpanded.value
					} else if (targetLocation !== location) {
						navigate(targetLocation)
					}
				}}
			>
				{subtasks.value.length > 0 ? (
					<ChevronRightIcon
						class={cn(
							"shrink-0 size-4 transition",
							isExpanded.value
								? "rotate-90 translate-y-px"
								: "rotate-0 translate-x-px",
							props.status.value === "started" && "animate-pulse",
						)}
						stroke-width="3"
					/>
				) : (
					<span
						class={cn(
							"shrink-0 m-1 size-2 bg-current rounded-full transition",
							props.status.value === "started" && "animate-pulse",
						)}
					/>
				)}
				<span class="text-gray-950 dark:text-gray-50 transition">
					{props.name}
					<span class="ml-2 text-xs/1 font-light text-gray-500 whitespace-nowrap">
						{props.status}
						{props.duration.value !== null
							? ` in ${formatDuration(props.duration.value)}`
							: null}
					</span>
				</span>
			</button>
			{subtasks.value.length > 0 ? (
				<ul
					class={cn(
						"flex flex-col ml-3.5 pl-2.5 border-l border-gray-400 dark:border-gray-700 transition",
						!isExpanded.value && "hidden",
					)}
				>
					{subtasks.value.map((task) => (
						<NavigationTreeNode key={task.id} {...task} />
					))}
				</ul>
			) : null}
		</li>
	)
}
