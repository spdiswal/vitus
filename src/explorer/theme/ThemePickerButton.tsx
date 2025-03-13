import type { SelectableTheme } from "+explorer/theme/Theme"
import { cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function ThemePickerButton(props: {
	theme: NonNullable<SelectableTheme>
	selectedTheme: SelectableTheme
	title: string
	onThemeSelected: (theme: SelectableTheme) => void
	children: Renderable
}): Renderable {
	const isSelected = props.theme === props.selectedTheme

	return (
		<button
			type="button"
			class={cn(
				"px-2 py-1 rounded-full transition outline-none",
				isSelected
					? "bg-gray-100 dark:bg-gray-800 text-blue-500"
					: "cursor-pointer hocus:bg-gray-300/80 dark:hocus:bg-gray-600/80",
			)}
			title={props.title}
			onClick={(): void => props.onThemeSelected(props.theme)}
		>
			{props.children}
		</button>
	)
}
