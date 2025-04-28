import { useProject } from "+explorer/UseProject"
import type { Module } from "+models/Module"
import type { Renderable } from "+types/Renderable"

export function ModuleBreadcrumbs(props: {
	module: Module
}): Renderable {
	const project = useProject()

	const modulePath = props.module.path
	const relativePath = modulePath.slice(project.rootPath.length + 1)
	const segments = relativePath.split("/")

	return (
		<div>
			{segments.map((segment, index) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: The array index is a stable key, as the order of path segments is immutable.
					key={index}
					class="last:font-bold after:px-1 after:content-['/'] last:after:content-none"
				>
					{segment}
				</span>
			))}
		</div>
	)
}
