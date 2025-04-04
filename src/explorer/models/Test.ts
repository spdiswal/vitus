import type { TestDto } from "+api/models/TestDto"
import type { Subtask } from "+explorer/models/Subtask"
import type { Duration } from "+types/Duration"
import type { NonEmptyArray } from "+types/NonEmptyArray"
import type { Computed, Reactive } from "+types/Reactive"
import type { TaskId } from "+types/TaskId"
import type { TaskStatus } from "+types/TaskStatus"
import { arrayEquals } from "+utilities/Arrays"
import { computed, signal } from "@preact/signals"

export type Test = {
	type: "test"
	id: TaskId
	parentId: TaskId
	fullName: Reactive<NonEmptyArray<string>>
	name: Computed<string>
	status: Reactive<TaskStatus>
	duration: Reactive<Duration | null>
	errors: Reactive<Array<unknown>>
}

export function dtoToTest(dto: TestDto): Test {
	const fullName = signal(dto.fullName)

	return {
		type: "test",
		id: dto.id,
		parentId: dto.parentId,
		fullName,
		name: computed(() => fullName.value.at(-1) as string), // `fullName` is guaranteed to have at least one item.
		status: signal(dto.status),
		duration: signal(dto.duration),
		errors: signal(dto.errors),
	}
}

export function testToDto(test: Test): TestDto {
	return {
		type: "test",
		id: test.id,
		parentId: test.parentId,
		fullName: test.fullName.value,
		status: test.status.value,
		duration: test.duration.value,
		errors: test.errors.value,
	}
}

export function updateTest(existingTest: Test, updatedTest: TestDto): void {
	if (!arrayEquals(existingTest.fullName.value, updatedTest.fullName)) {
		existingTest.fullName.value = updatedTest.fullName
	}
	existingTest.status.value = updatedTest.status
	existingTest.duration.value =
		updatedTest.status === "failed" || updatedTest.status === "passed"
			? updatedTest.duration
			: null
}

export function assertTest(subtask: Subtask): asserts subtask is Test {
	if (subtask.type !== "test") {
		throw new Error(
			`Expected a 'test' subtask, but got '${subtask.type}' with id '${subtask.id}'`,
		)
	}
}
