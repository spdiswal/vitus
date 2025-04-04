import type { TaskDto } from "+api/models/TaskDto"

export type TaskUpdatedDto = {
	type: "task-updated"
	task: TaskDto
}

export function taskUpdated(task: TaskDto): TaskUpdatedDto {
	return { type: "task-updated", task }
}
