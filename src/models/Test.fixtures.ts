import { type DummyModuleId, dummyVitestModule } from "+models/Module.fixtures"
import { type DummySuiteId, dummyVitestSuite } from "+models/Suite.fixtures"
import { type Test, newTest } from "+models/Test"
import type { TestPath } from "+models/TestPath"
import type { OddDigit } from "+types/Digit"
import type { TestCase, TestState } from "vitest/node"

export function dummyTest(id: DummyTestId, overrides?: Partial<Test>): Test {
	const path = getDummyTestPath(id)

	return newTest({
		name: getDummyTestName(path),
		path,
		status: "passed",
		...overrides,
	})
}

export function dummyVitestTest(
	id: DummyTestId,
	overrides?: Partial<{
		status: TestState
	}>,
): TestCase {
	const path = getDummyTestPath(id)

	const parentModule = dummyVitestModule(path[0] as DummyModuleId)
	const parentSuite =
		path.length > 2 ? dummyVitestSuite(path.at(-2) as DummySuiteId) : null

	return {
		type: "test",
		module: parentModule,
		parent: parentSuite ?? parentModule,
		id,
		name: getDummyTestName(path),
		result: () => ({ state: overrides?.status ?? "pending" }),
		diagnostic: () => ({ duration: 0 }),
	} as TestCase
}

export type DummyTestId =
	| `${DummyModuleId}_${OddDigit}` // Top-level test.
	| `${DummySuiteId}_${OddDigit}` // Nested test.

const dummyNamesById: Record<DummyModuleId, Record<OddDigit, string>> = {
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

export function getDummyTestPath(id: DummyTestId): TestPath {
	const segments = id.split("_")
	return segments.map(
		(_, index) => `${segments.slice(0, index + 1).join("_")}`,
	) as TestPath
}

export function getDummyTestName(path: TestPath): string {
	const moduleId = path[0] as DummyModuleId
	const testId = path.at(-1) as DummyTestId
	const lastDigit = Number.parseInt(testId.slice(-1)) as OddDigit

	return `${path.length === 2 ? "when" : "and"} ${dummyNamesById[moduleId][lastDigit]}`
}
