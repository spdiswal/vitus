import type { ModuleId } from "+api/models/ModuleId"
import { type Subtask, getSubtaskById, hasSubtask } from "+api/models/Subtask"
import { assertSuite } from "+api/models/Suite"
import type { SuiteId } from "+api/models/SuiteId"
import { useProject } from "+explorer/project/UseProject"
import { arrayEquals } from "+utilities/Arrays"
import { useRef } from "preact/hooks"

export function useParentSuiteNames(subtask: Subtask): Array<string> {
	const project = useProject()
	const cachedSuiteNames = useRef<Array<string>>([])

	const suiteNames: Array<string> = []
	let currentParentId: ModuleId | SuiteId | null = subtask.parentId

	while (
		currentParentId !== null &&
		currentParentId !== subtask.parentModuleId
	) {
		if (!hasSubtask(project, currentParentId)) {
			break
		}

		const parent = getSubtaskById(project, currentParentId)
		assertSuite(parent)

		suiteNames.push(parent.name)
		currentParentId = parent.parentId
	}

	suiteNames.reverse()

	if (arrayEquals(cachedSuiteNames.current, suiteNames)) {
		return cachedSuiteNames.current
	}

	cachedSuiteNames.current = suiteNames
	return suiteNames
}
