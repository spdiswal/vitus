import { ComputerDesktopIcon } from "+explorer/icons/ComputerDesktopIcon"
import { MoonIcon } from "+explorer/icons/MoonIcon"
import { SunIcon } from "+explorer/icons/SunIcon"
import { type SelectableTheme, isApplicableTheme } from "+explorer/theme/Theme"
import { ThemePickerButton } from "+explorer/theme/ThemePickerButton"
import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"
import { useMediaQuery } from "+utilities/UseMediaQuery"
import { useEffect, useState } from "preact/hooks"

/**
 * @see https://tailwindcss.com/docs/dark-mode#with-system-theme-support
 */
export function ThemePicker(props: {
	class?: ClassString
	initialTheme: SelectableTheme
}): Renderable {
	// Initialise the state with null to avoid hydration errors between server and client.
	const [selectedTheme, setSelectedTheme] = useState<SelectableTheme>(null)

	const prefersDark = useMediaQuery("(prefers-color-scheme: dark)")
	const systemTheme = prefersDark ? "dark" : "light"

	const appliedTheme = isApplicableTheme(selectedTheme)
		? selectedTheme
		: systemTheme

	useEffect(() => {
		// Apply the initial theme determined by the client, overriding the initial null state.
		setSelectedTheme(props.initialTheme)
	}, [props.initialTheme])

	useEffect(() => {
		document.documentElement.classList.toggle("dark", appliedTheme === "dark")
	}, [appliedTheme])

	useEffect(() => {
		if (isApplicableTheme(selectedTheme)) {
			localStorage.setItem("theme", selectedTheme)
		} else {
			localStorage.removeItem("theme")
		}
	}, [selectedTheme])

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
				selectedTheme={selectedTheme}
				onThemeSelected={setSelectedTheme}
			>
				<ComputerDesktopIcon class="size-5" />
			</ThemePickerButton>
			<ThemePickerButton
				theme="light"
				title="Light theme"
				selectedTheme={selectedTheme}
				onThemeSelected={setSelectedTheme}
			>
				<SunIcon class="size-5" />
			</ThemePickerButton>
			<ThemePickerButton
				theme="dark"
				title="Dark theme"
				selectedTheme={selectedTheme}
				onThemeSelected={setSelectedTheme}
			>
				<MoonIcon class="size-5" />
			</ThemePickerButton>
		</div>
	)
}
