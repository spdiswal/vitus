import { fileDeleted } from "+api/events/FileDeletedDto"
import { runCompleted } from "+api/events/RunCompletedDto"
import { runStarted } from "+api/events/RunStartedDto"
import { serverRestarted } from "+api/events/ServerRestartedDto"
import { taskUpdated } from "+api/events/TaskUpdatedDto"
import type { EventStream } from "+server/EventStream"
import { vitestModuleToDto } from "+server/models/VitestModule"
import { vitestSuiteToDto } from "+server/models/VitestSuite"
import { vitestTestToDto } from "+server/models/VitestTest"
import { mapNotNullishIterable } from "+utilities/Iterables"
import type { Reporter } from "vitest/reporters"

export type EventStreamReporter = Pick<
	Required<Reporter>,
	| "onServerRestart"
	| "onTestRunStart"
	| "onTestModuleQueued"
	| "onTestModuleStart"
	| "onTestSuiteReady"
	| "onTestCaseReady"
	| "onTestCaseResult"
	| "onTestSuiteResult"
	| "onTestModuleEnd"
	| "onTestRunEnd"
	| "onTestRemoved"
>

export function newEventStreamReporter(
	eventStream: EventStream,
): EventStreamReporter {
	return {
		onServerRestart(): void {
			eventStream.send(serverRestarted())
		},
		onTestRunStart(specifications): void {
			const invalidatedFileIds = mapNotNullishIterable(
				specifications,
				(specification) => specification.testModule?.id,
			)
			eventStream.send(runStarted(Array.from(invalidatedFileIds)))
		},
		onTestModuleQueued(module): void {
			eventStream.send(taskUpdated(vitestModuleToDto(module)))
		},
		onTestModuleStart(module): void {
			eventStream.send(taskUpdated(vitestModuleToDto(module)))
		},
		onTestSuiteReady(suite): void {
			eventStream.send(taskUpdated(vitestSuiteToDto(suite)))
		},
		onTestCaseReady(test): void {
			eventStream.send(taskUpdated(vitestTestToDto(test)))
		},
		onTestCaseResult(test): void {
			eventStream.send(taskUpdated(vitestTestToDto(test)))
		},
		onTestSuiteResult(suite): void {
			eventStream.send(taskUpdated(vitestSuiteToDto(suite)))
		},
		onTestModuleEnd(module): void {
			eventStream.send(taskUpdated(vitestModuleToDto(module)))
		},
		onTestRunEnd(): void {
			eventStream.send(runCompleted())
		},
		onTestRemoved(moduleId): void {
			if (moduleId) {
				eventStream.send(fileDeleted(moduleId))
			}
		},
	}
}
