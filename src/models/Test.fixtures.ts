import type { DummyFileId } from "+models/File.fixtures"
import type { DummySuiteId } from "+models/Suite.fixtures"
import { type Test, type TestPath, newTest } from "+models/Test"
import type {
	TestCase,
	TestModule,
	TestResult,
	TestState,
	TestSuite,
} from "vitest/node"

type OddDigit = 1 | 3 | 5 | 7 | 9

export type DummyTestId =
	| `${DummyFileId}_${OddDigit}` // Top-level test.
	| `${DummySuiteId}_${OddDigit}` // Nested test.

const dummyNamesById: Record<DummyFileId, Record<OddDigit, string>> = {
	"15b021ef72": {
		1: "pours a cup of apple juice",
		3: "changes the batteries",
		5: "refills the basket with fresh apples",
		7: "turns the ceiling lights on",
		9: "moves one tile to the north",
	},
	a3fdd8b6c3: {
		1: "pours a cup of banana smoothie",
		3: "recharges the smartphone",
		5: "refills the basket with fresh bananas",
		7: "turns the floor lamps on",
		9: "moves one tile to the east",
	},
	"-1730f876b4": {
		1: "pours a cup of orange juice",
		3: "plugs in the power cord",
		5: "refills the basket with fresh oranges",
		7: "turns the outdoor lights on",
		9: "moves one tile to the south",
	},
	"-e45b128829": {
		1: "pours a cup of peach smoothie",
		3: "amplifies the signal",
		5: "refills the basket with fresh peaches",
		7: "turns the table lamps on",
		9: "moves one tile to the west",
	},
}

export function dummyTest(id: DummyTestId, overrides?: Partial<Test>): Test {
	const path = getPathFromDummyTestId(id)
	const fileId = path[0] as DummyFileId
	const lastDigit = Number.parseInt(id.slice(-1)) as OddDigit

	return newTest({
		duration: 0,
		name: dummyNamesById[fileId][lastDigit],
		path,
		status: "passed",
		...overrides,
	})
}

export function getPathFromDummyTestId(id: DummyTestId): TestPath {
	const segments = id.split("_")
	return segments.map(
		(_, index) => `${segments.slice(0, index + 1).join("_")}`,
	) as TestPath
}

export function fakeVitestTest(props: {
	parentModule: TestModule
	parentSuite: TestSuite | null
	id: string
	name: string
	status: TestState
}): TestCase {
	return {
		type: "test",
		module: props.parentModule,
		parent: props.parentSuite ?? props.parentModule,
		id: props.id,
		name: props.name,
		result: () => ({ state: props.status }) as TestResult,
	} as TestCase
}
