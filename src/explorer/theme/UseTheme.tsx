import type { Renderable } from "+types/Renderable"
import { assertContextValue } from "+utilities/AssertContextValue"
import { useMediaQuery } from "+utilities/UseMediaQuery"
import { createContext } from "preact"
import { useContext, useEffect, useMemo, useState } from "preact/hooks"

const ThemeContext = createContext<UseTheme | undefined>(undefined)

export type ApplicableTheme = "dark" | "light"
export type SelectableTheme = ApplicableTheme | "match" | null

export type UseTheme = {
	appliedTheme: ApplicableTheme
	selectedTheme: SelectableTheme
	setSelectedTheme: (theme: SelectableTheme) => void
}

/**
 * @see https://tailwindcss.com/docs/dark-mode#with-system-theme-support
 */
export function useTheme(): UseTheme {
	const value = useContext(ThemeContext)
	assertContextValue("ThemeProvider", value)

	return value
}

export function ThemeProvider(props: {
	initialTheme: SelectableTheme
	children: Renderable
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

	const contextValue = useMemo<UseTheme>(
		() => ({ appliedTheme, selectedTheme, setSelectedTheme }),
		[appliedTheme, selectedTheme],
	)

	return (
		<ThemeContext.Provider value={contextValue}>
			{props.children}
		</ThemeContext.Provider>
	)
}

function isApplicableTheme(
	theme: SelectableTheme | null,
): theme is ApplicableTheme {
	return theme === "dark" || theme === "light"
}
