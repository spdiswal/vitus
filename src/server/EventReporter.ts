import type { ProjectEvent } from "+events/ProjectEvent"
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
import type { EventStreamReporter } from "+server/EventStreamReporter"
import { notNullish } from "+utilities/Arrays"

export type EventReporter = {
	[VitestEvent in keyof EventStreamReporter]: (
		...args: Parameters<EventStreamReporter[VitestEvent]>
	) => ProjectEvent | null
}

export function createEventReporter(): EventReporter {
	return {
		onServerRestart(): ProjectEvent | null {
			return serverRestartedEvent()
		},
		onTestRunStart(specifications): ProjectEvent | null {
			const invalidatedFileIds = specifications
				.map((specification) => specification.testModule?.id)
				.filter(notNullish)

			return runStartedEvent({ invalidatedFileIds })
		},
		onTestModuleStart(module): ProjectEvent | null {
			return fileStartedEvent({ id: module.id, path: module.moduleId })
		},
		onTestSuiteReady(suite): ProjectEvent | null {
			const path = mapVitestToSuitePath(suite)
			return suiteStartedEvent({ name: suite.name, path })
		},
		onTestCaseReady(test): ProjectEvent | null {
			const path = mapVitestToTestPath(test)
			return testStartedEvent({ name: test.name, path })
		},
		onTestCaseResult(test): ProjectEvent | null {
			const duration = test.diagnostic()?.duration ?? 0
			const path = mapVitestToTestPath(test)

			switch (test.result().state) {
				case "failed": {
					return testFailedEvent({ duration, path })
				}
				case "passed": {
					return testPassedEvent({ duration, path })
				}
				case "skipped": {
					return testSkippedEvent({ duration, path })
				}
				default: {
					return null
				}
			}
		},
		onTestSuiteResult(suite): ProjectEvent | null {
			const path = mapVitestToSuitePath(suite)

			switch (suite.state()) {
				case "failed": {
					return suiteFailedEvent({ path })
				}
				case "passed": {
					return suitePassedEvent({ path })
				}
				case "skipped": {
					return suiteSkippedEvent({ path })
				}
				default: {
					return null
				}
			}
		},
		onTestModuleEnd(module): ProjectEvent | null {
			const duration = module.diagnostic().duration
			const id = module.id

			switch (module.state()) {
				case "failed": {
					return fileFailedEvent({ duration, id })
				}
				case "passed": {
					return filePassedEvent({ duration, id })
				}
				case "skipped": {
					return fileSkippedEvent({ duration, id })
				}
				default: {
					return null
				}
			}
		},
		onTestRunEnd(): ProjectEvent | null {
			return runCompletedEvent()
		},
		onTestRemoved(moduleId): ProjectEvent | null {
			return moduleId !== undefined
				? fileDeletedEvent({ path: moduleId })
				: null
		},
	}
}
