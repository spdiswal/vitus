import type { Project } from "+api/models/Project"
import { type Subtask, getSubtasks, putSubtask } from "+api/models/Subtask"
import { removeTasks } from "+api/models/Task"
import { byParentId } from "+api/models/TaskId"
import { byStatus } from "+api/models/TaskStatus"

export type SubtaskUpdated = {
	type: "subtask-updated"
	subtask: Subtask
}

export function subtaskUpdated(subtask: Subtask): SubtaskUpdated {
	return { type: "subtask-updated", subtask }
}

export function applySubtaskUpdated(
	project: Project,
	event: SubtaskUpdated,
): Project {
	const updatedProject = putSubtask(project, event.subtask)

	if (event.subtask.status === "started") {
		return updatedProject
	}

	const unfinishedChildSubtasks = getSubtasks(
		project,
		byParentId(event.subtask.id),
	).filter(byStatus("started"))

	return removeTasks(updatedProject, [], unfinishedChildSubtasks)
}
