import type { FileId } from "+models/File"
import type { Test } from "+models/Test"
import type { Computed, PickNonComputed } from "+types/Computed"
import type { Duration } from "+types/Duration"
import { type LastItemOf, toSum } from "+utilities/Arrays"

export type Suite = {
	id: Computed<SuiteId>
	duration: Computed<Duration>
	name: string
	path: SuitePath
	status: SuiteStatus
	children: Array<Suite | Test>
}

export type SuiteId = string
export type SuiteIds = Array<SuiteId>
export type SuitePath = [FileId, ...SuiteIds, SuiteId]
export type SuiteStatus = "failed" | "passed" | "running" | "skipped"

export function newSuite(suite: PickNonComputed<Suite>): Suite {
	const suiteId = suite.path.at(-1) as LastItemOf<SuitePath>
	return {
		...suite,
		duration: 0, // TODO: Compute duration from children.
		id: suiteId,
	}
}

export function isSuite(suiteOrTest: Suite | Test): suiteOrTest is Suite {
	return "children" in suiteOrTest
}

export function countSuiteChildren(suite: Suite): number {
	return (
		suite.children.length +
		suite.children.filter(isSuite).map(countSuiteChildren).reduce(toSum, 0)
	)
}

export function getSuiteChildIds(suite: Suite): Array<string> {
	return suite.children.flatMap((child) =>
		isSuite(child) ? [child.id, ...getSuiteChildIds(child)] : [child.id],
	)
}

export function dropUnfinishedSuiteChildren(suite: Suite): Suite {
	return newSuite({
		...suite,
		children: suite.children
			.filter((child) => child.status !== "running")
			.map((child) =>
				isSuite(child) ? dropUnfinishedSuiteChildren(child) : child,
			),
	})
}
