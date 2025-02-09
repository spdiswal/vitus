import { ComputerDesktopIcon } from "+explorer/icons/ComputerDesktopIcon"
import { MoonIcon } from "+explorer/icons/MoonIcon"
import { SunIcon } from "+explorer/icons/SunIcon"
import { ThemePickerButton } from "+explorer/theme/ThemePickerButton"
import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function ThemePicker(props: {
	class?: ClassString
}): Renderable {
	return (
		<div
			class={cn(
				"w-fit rounded-full bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-md ring-1 ring-gray-900/20 dark:ring-gray-100/20 transition",
				props.class,
			)}
		>
			<ThemePickerButton theme="match" title="Match browser theme">
				<ComputerDesktopIcon class="size-5" />
			</ThemePickerButton>
			<ThemePickerButton theme="light" title="Light theme">
				<SunIcon class="size-5" />
			</ThemePickerButton>
			<ThemePickerButton theme="dark" title="Dark theme">
				<MoonIcon class="size-5" />
			</ThemePickerButton>
		</div>
	)
}
