import type { NavigationNodeStatus } from "+explorer/navigation/NavigationNodeStatus"
import { type ClassString, cn, cx } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function NavigationButton(props: {
	class?: ClassString
	status: NavigationNodeStatus
	onClick: () => void
	children: Renderable
}): Renderable {
	return (
		<button
			type="button"
			class={cn(
				"flex justify-start items-center text-start gap-x-2 px-2 py-1.5 rounded-md outline-none hocus:ring-1 active:hocus:ring-2 transition cursor-pointer",
				cx(props.status)({
					commenced:
						"ring-amber-500 hocus:bg-amber-100 dark:ring-amber-700 dark:hocus:bg-amber-950",
					failed:
						"ring-rose-500 hocus:bg-rose-100 dark:ring-rose-700 dark:hocus:bg-rose-950",
					passed:
						"ring-green-500 hocus:bg-green-100 dark:ring-green-700 dark:hocus:bg-green-950",
					skipped:
						"ring-gray-400 hocus:bg-gray-200 dark:ring-gray-600 dark:hocus:bg-gray-800",
				}),
				props.class,
			)}
			onClick={props.onClick}
		>
			{props.children}
		</button>
	)
}
