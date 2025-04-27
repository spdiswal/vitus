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
			const invalidatedModuleIds = specifications
				.map((specification) => specification.testModule?.id)
				.filter(notNullish)

			eventStream.send(runStartedEvent({ invalidatedModuleIds }))
		},
		onTestModuleStart(module): void {
			eventStream.send(
				moduleStartedEvent({ id: module.id, path: module.moduleId }),
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
			const path = mapVitestToTestPath(test)

			switch (test.result().state) {
				case "failed": {
					eventStream.send(testFailedEvent({ path }))
					break
				}
				case "passed": {
					eventStream.send(testPassedEvent({ path }))
					break
				}
				case "skipped": {
					eventStream.send(testSkippedEvent({ path }))
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
			const id = module.id

			switch (module.state()) {
				case "failed": {
					eventStream.send(moduleFailedEvent({ id }))
					break
				}
				case "passed": {
					eventStream.send(modulePassedEvent({ id }))
					break
				}
				case "skipped": {
					eventStream.send(moduleSkippedEvent({ id }))
					break
				}
			}
		},
		onTestRunEnd(): void {
			eventStream.send(runCompletedEvent())
		},
		onTestRemoved(moduleId): void {
			if (moduleId !== undefined) {
				eventStream.send(moduleDeletedEvent({ path: moduleId }))
			}
		},
	}
}
