import type { TaskId } from "+api/models/TaskId"
import type { TaskStatus } from "+api/models/TaskStatus"

export type Suite = {
	type: "suite"
	id: TaskId
	parentId: TaskId
	parentModuleId: TaskId
	name: string
	status: TaskStatus
}
