export type ApplicableTheme = "dark" | "light"
export type SelectableTheme = ApplicableTheme | "match" | null

export function isApplicableTheme(
	theme: SelectableTheme | null,
): theme is ApplicableTheme {
	return theme === "dark" || theme === "light"
}
