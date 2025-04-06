import type { Duration } from "+types/Duration"
import type { TaskId } from "+types/TaskId"
import type { TaskStatus } from "+types/TaskStatus"

export type TestDto = {
	type: "test"
	id: TaskId
	parentId: TaskId
	moduleId: TaskId
	name: string
	status: TaskStatus
	duration: Duration | null
	errors: Array<unknown>
}
