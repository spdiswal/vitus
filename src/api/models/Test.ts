import type { TaskId } from "+api/models/TaskId"
import type { TaskStatus } from "+api/models/TaskStatus"

export type Test = {
	type: "test"
	id: TaskId
	parentId: TaskId
	parentModuleId: TaskId
	name: string
	status: TaskStatus
}
