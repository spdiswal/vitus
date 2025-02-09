import { type SelectableTheme, useTheme } from "+explorer/theme/UseTheme"
import { cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function ThemePickerButton(props: {
	theme: SelectableTheme
	title: string
	children: Renderable
}): Renderable {
	const { selectedTheme, setSelectedTheme } = useTheme()

	return (
		<button
			type="button"
			class={cn(
				"px-2 py-1 rounded-full transition outline-none",
				"data-selected:bg-gray-100 data-selected:dark:bg-gray-800 data-selected:text-blue-500",
				"not-data-selected:cursor-pointer not-data-selected:hocus:bg-gray-300/80 not-data-selected:dark:hocus:bg-gray-600/80",
			)}
			data-selected={selectedTheme === props.theme ? true : undefined}
			title={props.title}
			onClick={(): void => setSelectedTheme(props.theme)}
		>
			{props.children}
		</button>
	)
}
