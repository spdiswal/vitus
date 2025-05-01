import type { ModuleId } from "+api/models/ModuleId"
import type { SuiteId } from "+api/models/SuiteId"
import type { TaskStatus } from "+api/models/TaskStatus"

export type Suite = {
	type: "suite"
	id: SuiteId
	parentId: ModuleId | SuiteId
	parentModuleId: ModuleId
	name: string
	status: TaskStatus
}
