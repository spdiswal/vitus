import type { SuiteDto } from "+api/models/SuiteDto"
import type { Subtask } from "+explorer/models/Subtask"
import type { Duration } from "+types/Duration"
import type { Reactive } from "+types/Reactive"
import type { TaskId } from "+types/TaskId"
import type { TaskStatus } from "+types/TaskStatus"
import { signal } from "@preact/signals"

export type Suite = {
	type: "suite"
	id: TaskId
	parentId: TaskId
	parentFileId: TaskId
	name: Reactive<string>
	status: Reactive<TaskStatus>
	duration: Reactive<Duration | null>
	errors: Reactive<Array<unknown>>
}

export function dtoToSuite(dto: SuiteDto): Suite {
	return {
		type: "suite",
		id: dto.id,
		parentId: dto.parentId,
		parentFileId: dto.parentFileId,
		name: signal(dto.name),
		status: signal(dto.status),
		duration: signal(dto.duration),
		errors: signal(dto.errors),
	}
}

export function suiteToDto(suite: Suite): SuiteDto {
	return {
		type: "suite",
		id: suite.id,
		parentId: suite.parentId,
		parentFileId: suite.parentFileId,
		name: suite.name.value,
		status: suite.status.value,
		duration: suite.duration.value,
		errors: suite.errors.value,
	}
}

export function updateSuite(
	existingSuite: Suite,
	updatedSuite: SuiteDto,
): void {
	existingSuite.name.value = updatedSuite.name
	existingSuite.status.value = updatedSuite.status

	// TODO: Compute suite duration from children.
	existingSuite.duration.value =
		updatedSuite.status === "failed" || updatedSuite.status === "passed"
			? updatedSuite.duration
			: null
}

export function assertSuite(subtask: Subtask): asserts subtask is Suite {
	if (subtask.type !== "suite") {
		throw new Error(
			`Expected a 'suite' subtask, but got '${subtask.type}' with id '${subtask.id}'`,
		)
	}
}
