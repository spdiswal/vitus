import type { Test } from "+models/Test"
import { cn, cx } from "+types/ClassString"
import { formatDuration } from "+types/Duration"
import type { Renderable } from "+types/Renderable"
import { Link } from "wouter-preact"

export function NavigationTreeTestNode(props: Test): Renderable {
	return (
		<li class="pt-1 flex flex-col">
			<Link
				class={cn(
					"flex justify-start items-center text-start gap-x-2 px-2 py-1.5 rounded-md outline-none hocus:ring-1 active:hocus:ring-2 transition cursor-pointer",
					cx(props.status)({
						failed:
							"text-rose-500 ring-rose-500 hocus:bg-rose-100 dark:ring-rose-700 dark:hocus:bg-rose-950",
						passed:
							"text-green-500 ring-green-500 hocus:bg-green-100 dark:ring-green-700 dark:hocus:bg-green-950",
						running:
							"text-amber-500 ring-amber-500 hocus:bg-amber-100 dark:ring-amber-700 dark:hocus:bg-amber-950",
						skipped:
							"text-gray-400 ring-gray-400 hocus:bg-gray-200 dark:ring-gray-600 dark:hocus:bg-gray-800",
					}),
				)}
				href={`/${props.path.join("/")}`}
			>
				<span
					class={cn(
						"shrink-0 m-1 size-2 bg-current rounded-full transition",
						props.status === "running" && "animate-pulse",
					)}
				/>
				<span class="text-gray-950 dark:text-gray-50 transition">
					{props.name}
					{props.duration > 0 ? (
						<span class="ml-2 text-xs/1 font-light text-gray-500 whitespace-nowrap">
							in {formatDuration(props.duration)}
						</span>
					) : null}
				</span>
			</Link>
		</li>
	)
}
