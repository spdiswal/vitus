import type { EventStream } from "+server/EventStream"
import { mapToDeletedFileEvent, mapToFileEvent } from "+server/events/FileEvent"
import { mapToRunEvent } from "+server/events/RunEvent"
import { mapToServerEvent } from "+server/events/ServerEvent"
import { mapToSuiteEvent } from "+server/events/SuiteEvent"
import { mapToTestEvent } from "+server/events/TestEvent"
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

export function createEventStreamReporter(
	eventStream: EventStream,
): EventStreamReporter {
	return {
		onServerRestart(): void {
			eventStream.send(mapToServerEvent("restarted"))
		},
		onTestRunStart(specifications): void {
			eventStream.send(mapToRunEvent(specifications, "started"))
		},
		onTestModuleQueued(module): void {
			eventStream.send(mapToFileEvent(module, "registered"))
		},
		onTestModuleStart(module): void {
			eventStream.send(mapToFileEvent(module, "started"))
		},
		onTestSuiteReady(suite): void {
			eventStream.send(mapToSuiteEvent(suite, "started"))
		},
		onTestCaseReady(test): void {
			eventStream.send(mapToTestEvent(test, "started"))
		},
		onTestCaseResult(test): void {
			eventStream.send(mapToTestEvent(test))
		},
		onTestSuiteResult(suite): void {
			eventStream.send(mapToSuiteEvent(suite))
		},
		onTestModuleEnd(module): void {
			eventStream.send(mapToFileEvent(module))
		},
		onTestRunEnd(modules): void {
			eventStream.send(mapToRunEvent(modules, "completed"))
		},
		onTestRemoved(moduleId): void {
			if (moduleId !== undefined) {
				eventStream.send(mapToDeletedFileEvent(moduleId))
			}
		},
	}
}
