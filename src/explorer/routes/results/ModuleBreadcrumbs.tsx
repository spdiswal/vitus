import { useModule } from "+explorer/models/Module"
import { useRootPath } from "+explorer/models/RootPath"
import type { Renderable } from "+types/Renderable"
import type { TaskId } from "+types/TaskId"
import { useComputed } from "@preact/signals"

export function ModuleBreadcrumbs(props: {
	moduleId: TaskId
}): Renderable {
	const module = useModule(props.moduleId)
	const rootPath = useRootPath()

	const segments = useComputed(() => {
		if (module.value === null) {
			return null
		}

		const modulePath = module.value.path.value
		const relativePath = modulePath.slice(rootPath.value.length + 1)
		return relativePath.split("/")
	})

	return segments.value !== null ? (
		<div>
			{segments.value.map((segment, index) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: The array index is a stable key, as the order of path segments is immutable.
					key={index}
					class="last:font-bold after:px-1 after:content-['/'] last:after:content-none"
				>
					{segment}
				</span>
			))}
		</div>
	) : null
}
