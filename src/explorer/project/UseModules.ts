import type { Module, Modules } from "+api/models/Module"
import { useProject } from "+explorer/project/UseProject"
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
