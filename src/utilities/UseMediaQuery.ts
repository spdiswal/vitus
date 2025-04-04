import type { Computed } from "+types/Reactive"
import { useSignal, useSignalEffect } from "@preact/signals"

export type MediaQueryString = "(prefers-color-scheme: dark)"

export function useMediaQuery(query: MediaQueryString): Computed<boolean> {
	const isMatching = useSignal(false)

	useSignalEffect(() => {
		const mediaQuery = window.matchMedia(query)
		updateMatch()

		function updateMatch(): void {
			isMatching.value = mediaQuery.matches
		}

		mediaQuery.addEventListener("change", updateMatch)

		return function cleanUp(): void {
			mediaQuery.removeEventListener("change", updateMatch)
		}
	})

	return isMatching
}
