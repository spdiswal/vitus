import { type File, type Files, enumerateFiles } from "+explorer/models/File"
import type { Comparator } from "+types/Comparator"
import type { Computed } from "+types/Reactive"
import { arrayEquals } from "+utilities/Arrays"
import { useComputed } from "@preact/signals"
import { useRef } from "preact/hooks"

const byName: Comparator<File> = (a, b) =>
	a.name.peek().localeCompare(b.name.peek()) // `peek()` suffices as `name` does not change once a `File` is instantiated. A renamed file results in a new `File` instance.

export function useFiles(): Computed<Files> {
	const cachedFiles = useRef<Files>([])

	return useComputed<Files>(() => {
		const files = Array.from(enumerateFiles()).sort(byName)

		if (arrayEquals(cachedFiles.current, files)) {
			return cachedFiles.current
		}

		cachedFiles.current = files
		return files
	})
}
