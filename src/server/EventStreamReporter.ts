import type { EventStream } from "+events/EventStream"
import { moduleDeletedEvent } from "+events/module/ModuleDeletedEvent"
import { moduleUpdatedEvent } from "+events/module/ModuleUpdatedEvent"
import { runCompletedEvent } from "+events/run/RunCompletedEvent"
import { runStartedEvent } from "+events/run/RunStartedEvent"
import { serverRestartedEvent } from "+events/server/ServerRestartedEvent"
import { subtaskUpdatedEvent } from "+events/subtask/SubtaskUpdatedEvent"
import { mapVitestToModule } from "+models/Module"
import { mapVitestToSuite } from "+models/Suite"
import { mapVitestToTest } from "+models/Test"
import { notNullish } from "+utilities/Arrays"
import type { Reporter } from "vitest/reporters"

export type EventStreamReporter = Pick<
	Required<Reporter>,
	| "onServerRestart"
	| "onTestRunStart"
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
			eventStream.send(serverRestartedEvent())
		},
		onTestRunStart(specifications): void {
			const invalidatedModuleIds = specifications
				.map((specification) => specification.testModule?.id)
				.filter(notNullish)

			eventStream.send(runStartedEvent(invalidatedModuleIds))
		},
		onTestModuleStart(module): void {
			eventStream.send(moduleUpdatedEvent(mapVitestToModule(module)))
		},
		onTestSuiteReady(suite): void {
			eventStream.send(subtaskUpdatedEvent(mapVitestToSuite(suite)))
		},
		onTestCaseReady(test): void {
			eventStream.send(subtaskUpdatedEvent(mapVitestToTest(test)))
		},
		onTestCaseResult(test): void {
			eventStream.send(subtaskUpdatedEvent(mapVitestToTest(test)))
		},
		onTestSuiteResult(suite): void {
			eventStream.send(subtaskUpdatedEvent(mapVitestToSuite(suite)))
		},
		onTestModuleEnd(module): void {
			eventStream.send(moduleUpdatedEvent(mapVitestToModule(module)))
		},
		onTestRunEnd(): void {
			eventStream.send(runCompletedEvent())
		},
		onTestRemoved(moduleId): void {
			if (moduleId !== undefined) {
				eventStream.send(moduleDeletedEvent(moduleId))
			}
		},
	}
}
