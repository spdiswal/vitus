import { type SuitePath, getSuiteIdFromSuitePath } from "+models/SuitePath"
import {
	type Test,
	type TestId,
	type TestStatus,
	isTest,
	mapVitestToTest,
} from "+models/Test"
import type { Comparator } from "+types/Comparator"
import type { Computed, PickNonComputed } from "+types/Computed"
import type { Duration } from "+types/Duration"
import { toSum } from "+utilities/Arrays"
import type { TestCase, TestSuite, TestSuiteState } from "vitest/node"

export type Suite = {
	id: Computed<SuiteId>
	duration: Computed<Duration>
	name: string
	path: SuitePath
	status: SuiteStatus
	suitesAndTests: Array<Suite | Test>
}

export type SuiteId = string
export type SuiteIds = Array<SuiteId>
export type SuiteStatus = "failed" | "passed" | "running" | "skipped"

const bySuiteOrTestId: Comparator<Suite | Test> = (a, b) =>
	a.id.localeCompare(b.id, undefined, { numeric: true })

export function newSuite(props: PickNonComputed<Suite>): Suite {
	return {
		...props,
		duration: props.suitesAndTests
			.map((suiteOrTest) => suiteOrTest.duration)
			.reduce(toSum, 0),
		id: getSuiteIdFromSuitePath(props.path),
		suitesAndTests: props.suitesAndTests.toSorted(bySuiteOrTestId),
	}
}

export function isSuite(suiteOrTest: Suite | Test): suiteOrTest is Suite {
	return "suitesAndTests" in suiteOrTest
}

export function hasNestedSuites(
	suiteIds: SuiteIds,
): suiteIds is [...SuiteIds, SuiteId] {
	return suiteIds.length > 0
}

export function hasNotSuiteOrTestStatus(
	status: SuiteStatus | TestStatus,
): (suiteOrTest: Suite | Test) => boolean {
	return (suiteOrTest): boolean => suiteOrTest.status !== status
}

export function countSuiteChildren(suite: Suite): number {
	return (
		suite.suitesAndTests.length +
		suite.suitesAndTests
			.filter(isSuite)
			.map(countSuiteChildren)
			.reduce(toSum, 0)
	)
}

export function getSuiteChildIds(suite: Suite): Array<string> {
	return suite.suitesAndTests.flatMap((suiteOrTest) =>
		isSuite(suiteOrTest)
			? [suiteOrTest.id, ...getSuiteChildIds(suiteOrTest)]
			: [suiteOrTest.id],
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
	suiteId: SuiteId,
): Suite | null {
	return (
		parentSuite.suitesAndTests.find(
			(suiteOrTest): suiteOrTest is Suite =>
				suiteOrTest.id === suiteId && isSuite(suiteOrTest),
		) ?? null
	)
}

export function getNestedTestById(
	parentSuite: Suite,
	testId: TestId,
): Test | null {
	return (
		parentSuite.suitesAndTests.find(
			(suiteOrTest): suiteOrTest is Test =>
				suiteOrTest.id === testId && isTest(suiteOrTest),
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
	const existingSuiteOrTestIndex = parentSuite.suitesAndTests.findIndex(
		(suiteOrTest) => suiteOrTest.id === suiteOrTestToInsert.id,
	)

	const suitesAndTests: Array<Suite | Test> =
		existingSuiteOrTestIndex === -1
			? [...parentSuite.suitesAndTests, suiteOrTestToInsert]
			: parentSuite.suitesAndTests.with(
					existingSuiteOrTestIndex,
					suiteOrTestToInsert,
				)

	return newSuite({ ...parentSuite, suitesAndTests })
}

export function dropUnfinishedSuiteChildren(suite: Suite): Suite {
	return newSuite({
		...suite,
		suitesAndTests: suite.suitesAndTests
			.filter(hasNotSuiteOrTestStatus("running"))
			.map((suiteOrTest) =>
				isSuite(suiteOrTest)
					? dropUnfinishedSuiteChildren(suiteOrTest)
					: suiteOrTest,
			),
	})
}

const statusMap: Record<TestSuiteState, SuiteStatus> = {
	failed: "failed",
	passed: "passed",
	pending: "running",
	skipped: "skipped",
}

export function mapVitestToSuite(suite: TestSuite): Suite {
	return newSuite({
		name: suite.name,
		path: mapVitestToSuitePath(suite),
		status: statusMap[suite.state()],
		suitesAndTests: suite.children.array().map(mapVitestToSuiteOrTest),
	})
}

export function mapVitestToSuiteOrTest(
	suiteOrTest: TestSuite | TestCase,
): Suite | Test {
	return suiteOrTest.type === "suite"
		? mapVitestToSuite(suiteOrTest)
		: mapVitestToTest(suiteOrTest)
}

export function mapVitestToSuitePath(suite: TestSuite): SuitePath {
	return suite.parent.type === "module"
		? [suite.parent.id, suite.id]
		: [...mapVitestToSuitePath(suite.parent), suite.id]
}
