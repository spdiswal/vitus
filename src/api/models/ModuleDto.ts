import type { Duration } from "+types/Duration"
import type { TaskId } from "+types/TaskId"
import type { TaskStatus } from "+types/TaskStatus"

export type ModuleDto = {
	type: "module"
	id: TaskId
	path: string
	status: TaskStatus
	duration: Duration | null
	errors: Array<unknown>
}
