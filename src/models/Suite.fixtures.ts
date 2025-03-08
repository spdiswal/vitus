import { type DummyFileId, dummyVitestModule } from "+models/File.fixtures"
import { type Suite, newSuite } from "+models/Suite"
import type { SuitePath } from "+models/SuitePath"
import type { Test } from "+models/Test"
import type { EvenDigit } from "+types/Digit"
import type { TestSuite, TestSuiteState } from "vitest/node"

export function dummySuite(
	id: DummySuiteId,
	overrides?: Partial<Suite>,
	suitesAndTests?: Array<Suite | Test>,
): Suite {
	const path = getDummySuitePath(id)

	return newSuite({
		name: getDummySuiteName(path),
		path,
		status: "passed",
		suitesAndTests: suitesAndTests ?? [],
		...overrides,
	})
}

export function dummyVitestSuite(
	id: DummySuiteId,
	overrides?: Partial<{
		status: TestSuiteState
	}>,
): TestSuite {
	const path = getDummySuitePath(id)

	const parentModule = dummyVitestModule(path[0] as DummyFileId)
	const parentSuite =
		path.length > 2 ? dummyVitestSuite(path.at(-2) as DummySuiteId) : null

	return {
		type: "suite",
		module: parentModule,
		parent: parentSuite ?? parentModule,
		id,
		name: getDummySuiteName(path),
		state: () => overrides?.status ?? "pending",
	} as TestSuite
}

export type DummySuiteId =
	| `${DummyFileId}_${EvenDigit}` // Top-level suite.
	| `${DummyFileId}_${EvenDigit}_${EvenDigit}` // Nested suite (level 1).
	| `${DummyFileId}_${EvenDigit}_${EvenDigit}_${EvenDigit}` // Nested suite (level 2).

const dummyNamesById: Record<DummyFileId, Record<EvenDigit, string>> = {
	"15b021ef72": {
		0: "the fruit basket has no apples",
		2: "the spring break is over",
		4: "the music starts playing",
		6: "the fridge is out of apple juice",
		8: "travelling through time",
	},
	a3fdd8b6c3: {
		0: "the fruit basket has no bananas",
		2: "the summer break is over",
		4: "the music stops playing",
		6: "the fridge is out of banana smoothies",
		8: "travelling through space",
	},
	"-1730f876b4": {
		0: "the fruit basket has no oranges",
		2: "the autumn break is over",
		4: "the movie starts playing",
		6: "the fridge is out of orange juice",
		8: "travelling through memories",
	},
	"-e45b128829": {
		0: "the fruit basket has no peaches",
		2: "the winter break is over",
		4: "the movie stops playing",
		6: "the fridge is out of peach smoothies",
		8: "travelling through the sky",
	},
}

export function getDummySuitePath(id: DummySuiteId): SuitePath {
	const segments = id.split("_")
	return segments.map(
		(_, index) => `${segments.slice(0, index + 1).join("_")}`,
	) as SuitePath
}

export function getDummySuiteName(path: SuitePath): string {
	const fileId = path[0] as DummyFileId
	const suiteId = path.at(-1) as DummySuiteId
	const lastDigit = Number.parseInt(suiteId.slice(-1)) as EvenDigit

	return `${path.length === 2 ? "when" : "and"} ${dummyNamesById[fileId][lastDigit]}`
}
