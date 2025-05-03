import type { Task } from "+api/models/Task"

export type TaskStatus = "failed" | "passed" | "skipped" | "started"
export type TaskStatuses = Array<TaskStatus>

export function byStatus(status: TaskStatus): (task: Task) => boolean {
	return (task): boolean => task.status === status
}
