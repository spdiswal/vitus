import { ComputerDesktopIcon } from "+explorer/icons/ComputerDesktopIcon"
import { MoonIcon } from "+explorer/icons/MoonIcon"
import { SunIcon } from "+explorer/icons/SunIcon"
import {
	type ApplicableTheme,
	type SelectableTheme,
	isApplicableTheme,
} from "+explorer/theme/Theme"
import { ThemePickerButton } from "+explorer/theme/ThemePickerButton"
import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"
import { useMediaQuery } from "+utilities/UseMediaQuery"
import { useSignal, useSignalEffect } from "@preact/signals"
import { useComputed } from "@preact/signals"

/**
 * @see https://tailwindcss.com/docs/dark-mode#with-system-theme-support
 */
export function ThemePicker(props: {
	class?: ClassString
	initialTheme: SelectableTheme
}): Renderable {
	// Initialise the state with null to avoid hydration errors between server and client.
	const selectedTheme = useSignal<SelectableTheme>(null)

	useSignalEffect(() => {
		// Apply the initial theme determined by the client, overriding the initial null state.
		selectedTheme.value = props.initialTheme
	})

	function selectTheme(theme: SelectableTheme): void {
		selectedTheme.value = theme
	}

	const prefersDark = useMediaQuery("(prefers-color-scheme: dark)")
	const systemTheme = prefersDark ? "dark" : "light"

	const appliedTheme = useComputed<ApplicableTheme>(() =>
		isApplicableTheme(selectedTheme.value) ? selectedTheme.value : systemTheme,
	)

	useSignalEffect(() => {
		const needsDarkTheme = appliedTheme.value === "dark"
		document.documentElement.classList.toggle("dark", needsDarkTheme)
	})

	useSignalEffect(() => {
		if (isApplicableTheme(selectedTheme.value)) {
			localStorage.setItem("theme", selectedTheme.value)
		} else {
			localStorage.removeItem("theme")
		}
	})

	return (
		<div
			class={cn(
				"w-fit rounded-full bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-md ring-1 ring-gray-900/20 dark:ring-gray-100/20 transition",
				props.class,
			)}
		>
			<ThemePickerButton
				theme="match"
				title="Match browser theme"
				selectedTheme={selectedTheme.value}
				onThemeSelected={selectTheme}
			>
				<ComputerDesktopIcon class="size-5" />
			</ThemePickerButton>
			<ThemePickerButton
				theme="light"
				title="Light theme"
				selectedTheme={selectedTheme.value}
				onThemeSelected={selectTheme}
			>
				<SunIcon class="size-5" />
			</ThemePickerButton>
			<ThemePickerButton
				theme="dark"
				title="Dark theme"
				selectedTheme={selectedTheme.value}
				onThemeSelected={selectTheme}
			>
				<MoonIcon class="size-5" />
			</ThemePickerButton>
		</div>
	)
}
