import type { Duration } from "+types/Duration"
import type { NonEmptyArray } from "+types/NonEmptyArray"
import type { TaskId } from "+types/TaskId"
import type { TaskStatus } from "+types/TaskStatus"

export type SuiteDto = {
	type: "suite"
	id: TaskId
	parentId: TaskId
	fullName: NonEmptyArray<string>
	status: TaskStatus
	duration: Duration | null
	errors: Array<unknown>
}
