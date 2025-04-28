import type { Subtask } from "+models/Subtask"
import type { TaskId } from "+models/TaskId"
import type { TaskStatus } from "+models/TaskStatus"
import type { TestSuite } from "vitest/node"

export type Suite = {
	type: "suite"
	id: TaskId
	parentId: TaskId
	parentModuleId: TaskId
	name: string
	status: TaskStatus
}

export function mapVitestToSuite(suite: TestSuite): Suite {
	const status = suite.state()

	return {
		type: "suite",
		id: suite.id,
		parentId: suite.parent.id,
		parentModuleId: suite.module.id,
		name: suite.name,
		status: status === "pending" ? "started" : status,
	}
}

export function assertSuite(subtask: Subtask): asserts subtask is Suite {
	if (subtask.type !== "suite") {
		throw new Error(
			`Expected the subtask to be a suite, but was '${subtask.type}'`,
		)
	}
}
