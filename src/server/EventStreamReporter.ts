import type { EventStream } from "+events/EventStream"
import { createEventReporter } from "+server/EventReporter"
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

export function createEventStreamReporter(
	eventStream: EventStream,
): EventStreamReporter {
	const eventReporter = createEventReporter()

	return {
		onServerRestart(reason): void {
			eventStream.send(eventReporter.onServerRestart(reason))
		},
		onTestRunStart(specifications): void {
			eventStream.send(eventReporter.onTestRunStart(specifications))
		},
		onTestModuleStart(module): void {
			eventStream.send(eventReporter.onTestModuleStart(module))
		},
		onTestSuiteReady(suite): void {
			eventStream.send(eventReporter.onTestSuiteReady(suite))
		},
		onTestCaseReady(test): void {
			eventStream.send(eventReporter.onTestCaseReady(test))
		},
		onTestCaseResult(test): void {
			eventStream.send(eventReporter.onTestCaseResult(test))
		},
		onTestSuiteResult(suite): void {
			eventStream.send(eventReporter.onTestSuiteResult(suite))
		},
		onTestModuleEnd(module): void {
			eventStream.send(eventReporter.onTestModuleEnd(module))
		},
		onTestRunEnd(modules, unhandledErrors, reason): void {
			eventStream.send(
				eventReporter.onTestRunEnd(modules, unhandledErrors, reason),
			)
		},
		onTestRemoved(moduleId): void {
			eventStream.send(eventReporter.onTestRemoved(moduleId))
		},
	}
}
