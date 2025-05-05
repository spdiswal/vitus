import type { Task } from "+api/models/Task"
import type { Duration } from "+types/Duration"

export type TaskStatus = TaskFailed | TaskPassed | TaskSkipped | TaskStarted

export type TaskStatusType = TaskStatus["type"]

export type TaskFailed = {
	type: "failed"
	duration: Duration
}

export function failed(duration: Duration): TaskFailed {
	return { type: "failed", duration }
}

export type TaskPassed = {
	type: "passed"
	duration: Duration
}

export function passed(duration: Duration): TaskPassed {
	return { type: "passed", duration }
}

export type TaskSkipped = {
	type: "skipped"
}

export function skipped(): TaskSkipped {
	return { type: "skipped" }
}

export type TaskStarted = {
	type: "started"
}

export function started(): TaskStarted {
	return { type: "started" }
}

export function byStatus(status: TaskStatusType): (task: Task) => boolean {
	return (task): boolean => task.status.type === status
}

export function getTaskStatusFromVitest(
	status: "failed" | "passed" | "pending" | "queued" | "skipped",
	duration: Duration = 0,
): TaskStatus {
	switch (status) {
		case "failed": {
			return failed(duration)
		}
		case "passed": {
			return passed(duration)
		}
		case "pending":
		case "queued": {
			return started()
		}
		case "skipped": {
			return skipped()
		}
	}
}
