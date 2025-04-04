import type { TaskId } from "+types/TaskId"

export type RunStartedDto = {
	type: "run-started"
	invalidatedFileIds: Array<TaskId>
}

export function runStarted(invalidatedFileIds: Array<TaskId>): RunStartedDto {
	return { type: "run-started", invalidatedFileIds }
}
