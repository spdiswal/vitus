import type { ModuleId } from "+api/models/ModuleId"
import type { Subtask } from "+api/models/Subtask"
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

export function assertSuite(subtask: Subtask): asserts subtask is Suite {
	if (subtask.type !== "suite") {
		throw new Error(
			`Expected the subtask to be a suite, but it was a ${subtask.type}`,
		)
	}
}
