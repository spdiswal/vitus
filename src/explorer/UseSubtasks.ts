import {
	type Subtask,
	type Subtasks,
	enumerateSubtasksByParent,
} from "+explorer/models/Subtask"
import type { Task } from "+explorer/models/Task"
import type { Comparator } from "+types/Comparator"
import type { Computed } from "+types/Reactive"
import { arrayEquals } from "+utilities/Arrays"
import { useComputed } from "@preact/signals"
import { useRef } from "preact/hooks"

const byId: Comparator<Subtask> = (a, b) => a.id.localeCompare(b.id)

export function useSubtasks(parent: Task): Computed<Subtasks> {
	const cachedSubtasks = useRef<Subtasks>([])

	return useComputed<Subtasks>(() => {
		if (parent.type === "test") {
			return cachedSubtasks.current
		}

		const subtasks = Array.from(enumerateSubtasksByParent(parent.id)).sort(byId)

		if (arrayEquals(cachedSubtasks.current, subtasks)) {
			return cachedSubtasks.current
		}

		cachedSubtasks.current = subtasks
		return subtasks
	})
}
