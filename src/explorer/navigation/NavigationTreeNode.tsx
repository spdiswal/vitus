import { ChevronRightIcon } from "+explorer/icons/ChevronRightIcon"
import { NavigationTreeSuiteNode } from "+explorer/navigation/NavigationTreeSuiteNode"
import { NavigationTreeTestNode } from "+explorer/navigation/NavigationTreeTestNode"
import { type Suite, isSuite } from "+models/Suite"
import type { Test } from "+models/Test"
import { cn, cx } from "+types/ClassString"
import { type Duration, formatDuration } from "+types/Duration"
import type { Renderable } from "+types/Renderable"
import { useMemo, useState } from "preact/hooks"

export function NavigationTreeNode(props: {
	duration: Duration
	name: string
	status: "failed" | "passed" | "running" | "skipped"
	suitesAndTests: Array<Suite | Test>
}): Renderable {
	const [expanded, setExpanded] = useState(false)

	const memoisedSuitesAndTests = useMemo(
		() => (
			<ul
				class={cn(
					"flex flex-col ml-3.5 pl-2.5 border-l border-gray-400 dark:border-gray-700 transition",
					!expanded && "hidden",
				)}
			>
				{props.suitesAndTests.map((suiteOrTest) =>
					isSuite(suiteOrTest) ? (
						<NavigationTreeSuiteNode key={suiteOrTest.id} {...suiteOrTest} />
					) : (
						<NavigationTreeTestNode key={suiteOrTest.id} {...suiteOrTest} />
					),
				)}
			</ul>
		),
		[props.suitesAndTests, expanded],
	)

	return (
		<li class="pt-1 flex flex-col">
			<button
				type="button"
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
				onClick={(): void => setExpanded(!expanded)}
			>
				<ChevronRightIcon
					class={cn(
						"shrink-0 size-4 transition",
						expanded ? "rotate-90 translate-y-px" : "rotate-0 translate-x-px",
						props.status === "running" && "animate-pulse",
					)}
					stroke-width="3"
				/>
				<span class="text-gray-950 dark:text-gray-50 transition">
					{props.name}
					{props.duration > 0 ? (
						<span class="ml-2 text-xs/1 font-light text-gray-500 whitespace-nowrap">
							in {formatDuration(props.duration)}
						</span>
					) : null}
				</span>
			</button>
			{memoisedSuitesAndTests}
		</li>
	)
}
