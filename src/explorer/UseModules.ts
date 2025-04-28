import { useProject } from "+explorer/UseProject"
import type { Module, Modules } from "+models/Module"
import type { Comparator } from "+types/Comparator"
import { arrayEquals } from "+utilities/Arrays"
import { useRef } from "preact/hooks"

const byName: Comparator<Module> = (a, b) =>
	a.filename.localeCompare(b.filename)

export function useModules(): Modules {
	const project = useProject()
	const cachedModules = useRef<Modules>([])

	const modules: Modules = Object.values(project.modulesById).sort(byName)

	if (arrayEquals(cachedModules.current, modules)) {
		return cachedModules.current
	}

	cachedModules.current = modules
	return modules
}
