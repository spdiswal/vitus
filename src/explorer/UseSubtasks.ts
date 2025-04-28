import { useProject } from "+explorer/UseProject"
import type { Subtask, Subtasks } from "+models/Subtask"
import type { TaskId } from "+models/TaskId"
import type { Comparator } from "+types/Comparator"
import { arrayEquals } from "+utilities/Arrays"
import { useRef } from "preact/hooks"

const byId: Comparator<Subtask> = (a, b) =>
	a.id.localeCompare(b.id, undefined, { numeric: true })

export function useSubtasks(parentId: TaskId): Subtasks {
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
