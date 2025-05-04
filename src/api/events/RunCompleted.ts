import { getModules } from "+api/models/Module"
import type { Project } from "+api/models/Project"
import { getSubtasks } from "+api/models/Subtask"
import { removeTasks } from "+api/models/Task"
import { byStatus, computeProjectStatus } from "+api/models/TaskStatus"

export type RunCompleted = {
	type: "run-completed"
}

export function runCompleted(): RunCompleted {
	return { type: "run-completed" }
}

export function applyRunCompleted(project: Project): Project {
	const unfinishedModules = getModules(project, byStatus("started"))
	const unfinishedSubtasks = getSubtasks(project, byStatus("started"))

	const updatedProject = removeTasks(
		project,
		unfinishedModules,
		unfinishedSubtasks,
	)
	const newProjectStatus = computeProjectStatus(updatedProject.modulesById)

	if (newProjectStatus !== updatedProject.status) {
		return { ...updatedProject, status: newProjectStatus }
	}

	return updatedProject
}
