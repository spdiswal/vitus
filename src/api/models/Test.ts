import type { ModuleId } from "+api/models/ModuleId"
import type { SuiteId } from "+api/models/SuiteId"
import type { TaskStatus } from "+api/models/TaskStatus"
import type { TestId } from "+api/models/TestId"

export type Test = {
	type: "test"
	id: TestId
	parentId: ModuleId | SuiteId
	parentModuleId: ModuleId
	name: string
	status: TaskStatus
}
