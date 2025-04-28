import type { EventStream } from "+events/EventStream"
import { moduleDeletedEvent } from "+events/module/ModuleDeletedEvent"
import { moduleFailedEvent } from "+events/module/ModuleFailedEvent"
import { modulePassedEvent } from "+events/module/ModulePassedEvent"
import { moduleSkippedEvent } from "+events/module/ModuleSkippedEvent"
import { moduleStartedEvent } from "+events/module/ModuleStartedEvent"
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
			eventStream.send(moduleStartedEvent(mapVitestToModule(module)))
		},
		onTestSuiteReady(suite): void {
			eventStream.send(suiteStartedEvent(mapVitestToSuite(suite)))
		},
		onTestCaseReady(test): void {
			eventStream.send(testStartedEvent(mapVitestToTest(test)))
		},
		onTestCaseResult(test): void {
			switch (test.result().state) {
				case "failed": {
					eventStream.send(testFailedEvent(mapVitestToTest(test)))
					break
				}
				case "passed": {
					eventStream.send(testPassedEvent(mapVitestToTest(test)))
					break
				}
				case "skipped": {
					eventStream.send(testSkippedEvent(mapVitestToTest(test)))
					break
				}
			}
		},
		onTestSuiteResult(suite): void {
			switch (suite.state()) {
				case "failed": {
					eventStream.send(suiteFailedEvent(mapVitestToSuite(suite)))
					break
				}
				case "passed": {
					eventStream.send(suitePassedEvent(mapVitestToSuite(suite)))
					break
				}
				case "skipped": {
					eventStream.send(suiteSkippedEvent(mapVitestToSuite(suite)))
					break
				}
			}
		},
		onTestModuleEnd(module): void {
			switch (module.state()) {
				case "failed": {
					eventStream.send(moduleFailedEvent(mapVitestToModule(module)))
					break
				}
				case "passed": {
					eventStream.send(modulePassedEvent(mapVitestToModule(module)))
					break
				}
				case "skipped": {
					eventStream.send(moduleSkippedEvent(mapVitestToModule(module)))
					break
				}
			}
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
