import type { FileId } from "+models/File"
import type { Computed, PickNonComputed } from "+types/Computed"

export type Suite = {
	id: Computed<SuiteId>
	name: string
	path: SuitePath
	status: SuiteStatus
}

export type Suites = Array<Suite>

export type SuiteId = string
export type SuiteIds = Array<SuiteId>
export type SuitePath = [FileId, SuiteId]
export type SuiteStatus = "failed" | "passed" | "running" | "skipped"

export function newSuite(suite: PickNonComputed<Suite>): Suite {
	const [, suiteId] = suite.path
	return { ...suite, id: suiteId }
}
