import { useEffect, useState } from "preact/hooks"

export type MediaQueryString = "(prefers-color-scheme: dark)"

export function useMediaQuery(query: MediaQueryString): boolean {
	const [matching, setMatching] = useState(false)

	useEffect(() => {
		const mediaQuery = window.matchMedia(query)
		updateMatch()

		function updateMatch(): void {
			setMatching(mediaQuery.matches)
		}

		mediaQuery.addEventListener("change", updateMatch)

		return function cleanUp(): void {
			mediaQuery.removeEventListener("change", updateMatch)
		}
	}, [query])

	return matching
}
