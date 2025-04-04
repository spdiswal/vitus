import type { SuiteDto } from "+api/models/SuiteDto"
import type { Subtask } from "+explorer/models/Subtask"
import type { Duration } from "+types/Duration"
import type { NonEmptyArray } from "+types/NonEmptyArray"
import type { Computed, Reactive } from "+types/Reactive"
import type { TaskId } from "+types/TaskId"
import type { TaskStatus } from "+types/TaskStatus"
import { arrayEquals } from "+utilities/Arrays"
import { computed, signal } from "@preact/signals"

export type Suite = {
	type: "suite"
	id: TaskId
	parentId: TaskId
	parentFileId: TaskId
	fullName: Reactive<NonEmptyArray<string>>
	name: Computed<string>
	status: Reactive<TaskStatus>
	duration: Reactive<Duration | null>
	errors: Reactive<Array<unknown>>
}

export function dtoToSuite(dto: SuiteDto): Suite {
	const fullName = signal(dto.fullName)

	return {
		type: "suite",
		id: dto.id,
		parentId: dto.parentId,
		parentFileId: dto.parentFileId,
		fullName,
		name: computed(() => fullName.value.at(-1) as string), // `fullName` is guaranteed to have at least one item.
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
		fullName: suite.fullName.value,
		status: suite.status.value,
		duration: suite.duration.value,
		errors: suite.errors.value,
	}
}

export function updateSuite(
	existingSuite: Suite,
	updatedSuite: SuiteDto,
): void {
	if (!arrayEquals(existingSuite.fullName.value, updatedSuite.fullName)) {
		existingSuite.fullName.value = updatedSuite.fullName
	}
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
