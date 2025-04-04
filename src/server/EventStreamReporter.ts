import { fileDeleted } from "+events/FileDeleted"
import { runCompleted } from "+events/RunCompleted"
import { runStarted } from "+events/RunStarted"
import { serverRestarted } from "+events/ServerRestarted"
import { taskUpdated } from "+events/TaskUpdated"
import type { TaskIds } from "+models/TaskId"
import { mapVitestModuleIdToName } from "+models/mappers/MapVitestModuleIdToName"
import { mapVitestModuleToSerialisableFile } from "+models/mappers/MapVitestModuleToSerialisableFile"
import { mapVitestSuiteToSerialisableSuite } from "+models/mappers/MapVitestSuiteToSerialisableSuite"
import { mapVitestTestToSerialisableTest } from "+models/mappers/MapVitestTestToSerialisableTest"
import type { EventStream } from "+server/EventStream"
import { notNullish } from "+utilities/Arrays"
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
			const invalidatedFileIds: TaskIds = specifications
				.map((specification) => specification.testModule?.id)
				.filter(notNullish)

			eventStream.send(runStarted(invalidatedFileIds))
		},
		onTestModuleQueued(module): void {
			eventStream.send(taskUpdated(mapVitestModuleToSerialisableFile(module)))
		},
		onTestModuleStart(module): void {
			eventStream.send(taskUpdated(mapVitestModuleToSerialisableFile(module)))
		},
		onTestSuiteReady(suite): void {
			eventStream.send(taskUpdated(mapVitestSuiteToSerialisableSuite(suite)))
		},
		onTestCaseReady(test): void {
			eventStream.send(taskUpdated(mapVitestTestToSerialisableTest(test)))
		},
		onTestCaseResult(test): void {
			eventStream.send(taskUpdated(mapVitestTestToSerialisableTest(test)))
		},
		onTestSuiteResult(suite): void {
			eventStream.send(taskUpdated(mapVitestSuiteToSerialisableSuite(suite)))
		},
		onTestModuleEnd(module): void {
			eventStream.send(taskUpdated(mapVitestModuleToSerialisableFile(module)))
		},
		onTestRunEnd(): void {
			eventStream.send(runCompleted())
		},
		onTestRemoved(moduleId): void {
			if (moduleId) {
				eventStream.send(fileDeleted(mapVitestModuleIdToName(moduleId)))
			}
		},
	}
}
