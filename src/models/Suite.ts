import type { FileId } from "+models/File"
import { type Test, type TestId, isTest } from "+models/Test"
import type { Comparator } from "+types/Comparator"
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

const byChildId: Comparator<Suite | Test> = (a, b) =>
	a.id.localeCompare(b.id, undefined, { numeric: true })

export function newSuite(props: PickNonComputed<Suite>): Suite {
	const suiteId = props.path.at(-1) as LastItemOf<SuitePath>
	return {
		...props,
		children: props.children.toSorted(byChildId),
		duration: 0, // TODO: Compute duration from children.
		id: suiteId,
	}
}

export function isSuite(suiteOrTest: Suite | Test): suiteOrTest is Suite {
	return "children" in suiteOrTest
}

export function hasNestedSuites(
	suiteIds: SuiteIds,
): suiteIds is [...SuiteIds, SuiteId] {
	return suiteIds.length > 0
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

export function getDeeplyNestedSuiteByPath(
	parentSuite: Suite,
	suitePath: [...SuiteIds, SuiteId],
): Suite | null {
	const [nextSuiteId, ...remainingPath] = suitePath
	const nextSuite = getNestedSuiteById(parentSuite, nextSuiteId)

	return !hasNestedSuites(remainingPath) || nextSuite === null
		? nextSuite
		: getDeeplyNestedSuiteByPath(nextSuite, remainingPath)
}

export function getNestedSuiteById(
	parentSuite: Suite,
	childSuiteId: SuiteId,
): Suite | null {
	return (
		parentSuite.children.find(
			(child): child is Suite => child.id === childSuiteId && isSuite(child),
		) ?? null
	)
}

export function getNestedTestById(
	parentSuite: Suite,
	childTestId: TestId,
): Test | null {
	return (
		parentSuite.children.find(
			(child): child is Test => child.id === childTestId && isTest(child),
		) ?? null
	)
}

export function putDeeplyNestedSuiteOrTest(
	parentSuite: Suite,
	suitePath: [...SuiteIds, SuiteId],
	suiteOrTestToInsert: Suite | Test,
): Suite {
	const [nextSuiteId, ...remainingPath] = suitePath

	if (isSuite(suiteOrTestToInsert) && !hasNestedSuites(remainingPath)) {
		return putNestedSuiteOrTest(parentSuite, suiteOrTestToInsert)
	}

	const nextSuite = getNestedSuiteById(parentSuite, nextSuiteId)

	if (nextSuite === null) {
		return parentSuite
	}

	const updatedNextSuite = hasNestedSuites(remainingPath)
		? putDeeplyNestedSuiteOrTest(nextSuite, remainingPath, suiteOrTestToInsert)
		: putNestedSuiteOrTest(nextSuite, suiteOrTestToInsert)

	return putNestedSuiteOrTest(parentSuite, updatedNextSuite)
}

export function putNestedSuiteOrTest(
	parentSuite: Suite,
	suiteOrTestToInsert: Suite | Test,
): Suite {
	const existingSuiteOrTestIndex = parentSuite.children.findIndex(
		(child) => child.id === suiteOrTestToInsert.id,
	)

	const children: Array<Suite | Test> =
		existingSuiteOrTestIndex === -1
			? [...parentSuite.children, suiteOrTestToInsert]
			: parentSuite.children.with(existingSuiteOrTestIndex, suiteOrTestToInsert)

	return newSuite({ ...parentSuite, children })
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
