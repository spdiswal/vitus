import type { TaskId } from "+types/TaskId"

export type RunStartedDto = {
	type: "run-started"
	invalidatedModuleIds: Array<TaskId>
}

export function runStarted(invalidatedModuleIds: Array<TaskId>): RunStartedDto {
	return { type: "run-started", invalidatedModuleIds }
}
