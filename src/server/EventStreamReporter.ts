import { moduleDeleted } from "+api/events/ModuleDeleted"
import { moduleUpdated } from "+api/events/ModuleUpdated"
import { runCompleted } from "+api/events/RunCompleted"
import { runStarted } from "+api/events/RunStarted"
import { serverRestarted } from "+api/events/ServerRestarted"
import { subtaskUpdated } from "+api/events/SubtaskUpdated"
import type { ModuleIds } from "+api/models/ModuleId"
import type { EventStream } from "+server/EventStream"
import { newModuleFromVitest } from "+server/models/VitestModule"
import { newSuiteFromVitest } from "+server/models/VitestSuite"
import { newTestFromVitest } from "+server/models/VitestTest"
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
			eventStream.send(serverRestarted())
		},
		onTestRunStart(specifications): void {
			const invalidatedModuleIds: ModuleIds = specifications
				.map((specification) => specification.testModule?.id)
				.filter(notNullish)

			eventStream.send(runStarted(invalidatedModuleIds))
		},
		onTestModuleStart(module): void {
			eventStream.send(
				moduleUpdated(newModuleFromVitest(module, { status: "pending" })),
			)
		},
		onTestSuiteReady(suite): void {
			eventStream.send(
				subtaskUpdated(newSuiteFromVitest(suite, { status: "pending" })),
			)
		},
		onTestCaseReady(test): void {
			eventStream.send(
				subtaskUpdated(newTestFromVitest(test, { status: "pending" })),
			)
		},
		onTestCaseResult(test): void {
			eventStream.send(subtaskUpdated(newTestFromVitest(test)))
		},
		onTestSuiteResult(suite): void {
			eventStream.send(subtaskUpdated(newSuiteFromVitest(suite)))
		},
		onTestModuleEnd(module): void {
			eventStream.send(moduleUpdated(newModuleFromVitest(module)))
		},
		onTestRunEnd(): void {
			eventStream.send(runCompleted())
		},
		onTestRemoved(moduleId): void {
			if (moduleId !== undefined) {
				eventStream.send(moduleDeleted(moduleId))
			}
		},
	}
}
