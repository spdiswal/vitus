import type { Module } from "+api/models/Module"
import { useProject } from "+explorer/project/UseProject"
import type { Renderable } from "+types/Renderable"
import { useEffect } from "preact/hooks"

export function ModuleBreadcrumbs(props: {
	module: Module
}): Renderable {
	const project = useProject()

	const modulePath = props.module.path
	const relativePath = modulePath.slice(project.rootPath.length + 1)
	const segments = relativePath.split("/")

	useEffect(() => {
		document.title = `${props.module.filename} – Vitest – Vitus`
	}, [props.module.filename])

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
