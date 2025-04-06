import { useFile } from "+explorer/models/File"
import { useRootPath } from "+explorer/models/RootPath"
import type { Renderable } from "+types/Renderable"
import type { TaskId } from "+types/TaskId"
import { useComputed } from "@preact/signals"

export function FileBreadcrumbs(props: {
	fileId: TaskId
}): Renderable {
	const file = useFile(props.fileId)
	const rootPath = useRootPath()

	const segments = useComputed(() => {
		if (file.value === null) {
			return null
		}

		const filePath = file.value.path.value
		const relativeFilePath = filePath.slice(rootPath.value.length + 1)
		return relativeFilePath.split("/")
	})

	return segments.value !== null ? (
		<div>
			{segments.value.map((segment, index) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: The array index is a stable key, as the order of path segments is immutable.
					key={index}
					class="last:font-bold after:content-['/'] last:after:content-none"
				>
					{segment}
				</span>
			))}
		</div>
	) : null
}
