import type { EventStream } from "+events/EventStream"
import { fileDeletedEvent } from "+events/file/FileDeletedEvent"
import { fileFailedEvent } from "+events/file/FileFailedEvent"
import { filePassedEvent } from "+events/file/FilePassedEvent"
import { fileSkippedEvent } from "+events/file/FileSkippedEvent"
import { fileStartedEvent } from "+events/file/FileStartedEvent"
import { runCompletedEvent } from "+events/run/RunCompletedEvent"
import { runStartedEvent } from "+events/run/RunStartedEvent"
import { serverRestartedEvent } from "+events/server/ServerRestartedEvent"
import { suiteFailedEvent } from "+events/suite/SuiteFailedEvent"
import { suitePassedEvent } from "+events/suite/SuitePassedEvent"
import { suiteSkippedEvent } from "+events/suite/SuiteSkippedEvent"
import { suiteStartedEvent } from "+events/suite/SuiteStartedEvent"
import { testFailedEvent } from "+events/test/TestFailedEvent"
import { testPassedEvent } from "+events/test/TestPassedEvent"
import { testSkippedEvent } from "+events/test/TestSkippedEvent"
import { testStartedEvent } from "+events/test/TestStartedEvent"
import { mapVitestToSuitePath } from "+models/Suite"
import { mapVitestToTestPath } from "+models/Test"
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
			const invalidatedFileIds = specifications
				.map((specification) => specification.testModule?.id)
				.filter(notNullish)

			eventStream.send(runStartedEvent({ invalidatedFileIds }))
		},
		onTestModuleStart(module): void {
			eventStream.send(
				fileStartedEvent({ id: module.id, path: module.moduleId }),
			)
		},
		onTestSuiteReady(suite): void {
			const path = mapVitestToSuitePath(suite)
			eventStream.send(suiteStartedEvent({ name: suite.name, path }))
		},
		onTestCaseReady(test): void {
			const path = mapVitestToTestPath(test)
			eventStream.send(testStartedEvent({ name: test.name, path }))
		},
		onTestCaseResult(test): void {
			const duration = test.diagnostic()?.duration ?? 0
			const path = mapVitestToTestPath(test)

			switch (test.result().state) {
				case "failed": {
					eventStream.send(testFailedEvent({ duration, path }))
					break
				}
				case "passed": {
					eventStream.send(testPassedEvent({ duration, path }))
					break
				}
				case "skipped": {
					eventStream.send(testSkippedEvent({ duration, path }))
					break
				}
			}
		},
		onTestSuiteResult(suite): void {
			const path = mapVitestToSuitePath(suite)

			switch (suite.state()) {
				case "failed": {
					eventStream.send(suiteFailedEvent({ path }))
					break
				}
				case "passed": {
					eventStream.send(suitePassedEvent({ path }))
					break
				}
				case "skipped": {
					eventStream.send(suiteSkippedEvent({ path }))
					break
				}
			}
		},
		onTestModuleEnd(module): void {
			const duration = module.diagnostic().duration
			const id = module.id

			switch (module.state()) {
				case "failed": {
					eventStream.send(fileFailedEvent({ duration, id }))
					break
				}
				case "passed": {
					eventStream.send(filePassedEvent({ duration, id }))
					break
				}
				case "skipped": {
					eventStream.send(fileSkippedEvent({ duration, id }))
					break
				}
			}
		},
		onTestRunEnd(): void {
			eventStream.send(runCompletedEvent())
		},
		onTestRemoved(moduleId): void {
			if (moduleId !== undefined) {
				eventStream.send(fileDeletedEvent({ path: moduleId }))
			}
		},
	}
}
