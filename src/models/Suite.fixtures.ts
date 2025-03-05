import type { DummyFileId } from "+models/File.fixtures"
import { type Suite, type SuitePath, newSuite } from "+models/Suite"
import type { Test } from "+models/Test"
import type { TestModule, TestSuite, TestSuiteState } from "vitest/node"

type EvenDigit = 0 | 2 | 4 | 6 | 8

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

export function dummySuite(
	id: DummySuiteId,
	overrides?: Partial<Suite>,
	children?: Array<Suite | Test>,
): Suite {
	const path = getPathFromDummySuiteId(id)
	const fileId = path[0] as DummyFileId
	const lastDigit = Number.parseInt(id.slice(-1)) as EvenDigit

	return newSuite({
		name: `${path.length === 2 ? "when" : "and"} ${dummyNamesById[fileId][lastDigit]}`,
		path,
		status: "passed",
		children: children ?? [],
		...overrides,
	})
}

export function getPathFromDummySuiteId(id: DummySuiteId): SuitePath {
	const segments = id.split("_")
	return segments.map(
		(_, index) => `${segments.slice(0, index + 1).join("_")}`,
	) as SuitePath
}

export function fakeVitestSuite(props: {
	parentModule: TestModule
	parentSuite: TestSuite | null
	id: string
	name: string
	status: TestSuiteState
}): TestSuite {
	return {
		type: "suite",
		module: props.parentModule,
		parent: props.parentSuite ?? props.parentModule,
		id: props.id,
		name: props.name,
		state: () => props.status,
	} as TestSuite
}
