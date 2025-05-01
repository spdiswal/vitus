import type { ModuleId } from "+api/models/ModuleId"
import type { Subtask, Subtasks } from "+api/models/Subtask"
import type { SuiteId } from "+api/models/SuiteId"
import { useProject } from "+explorer/project/UseProject"
import type { Comparator } from "+types/Comparator"
import { arrayEquals } from "+utilities/Arrays"
import { useRef } from "preact/hooks"

const byId: Comparator<Subtask> = (a, b) =>
	a.id.localeCompare(b.id, undefined, { numeric: true })

export function useSubtasks(parentId: ModuleId | SuiteId): Subtasks {
	const project = useProject()
	const cachedSubtasks = useRef<Subtasks>([])

	const subtasks: Subtasks = Object.values(project.subtasksById)
		.filter((subtask) => subtask.parentId === parentId)
		.sort(byId)

	if (arrayEquals(cachedSubtasks.current, subtasks)) {
		return cachedSubtasks.current
	}

	cachedSubtasks.current = subtasks
	return subtasks
}
