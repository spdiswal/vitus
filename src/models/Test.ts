import type { Subtask } from "+models/Subtask"
import type { TaskId } from "+models/TaskId"
import type { TaskStatus } from "+models/TaskStatus"
import type { TestCase } from "vitest/node"

export type Test = {
	type: "test"
	id: TaskId
	parentId: TaskId
	parentModuleId: TaskId
	name: string
	status: TaskStatus
}

export function mapVitestToTest(test: TestCase): Test {
	const status = test.result().state

	return {
		type: "test",
		id: test.id,
		parentId: test.parent.id,
		parentModuleId: test.module.id,
		name: test.name,
		status: status === "pending" ? "running" : status,
	}
}

export function assertTest(subtask: Subtask): asserts subtask is Test {
	if (subtask.type !== "test") {
		throw new Error(
			`Expected the subtask to be a test, but was '${subtask.type}'`,
		)
	}
}
