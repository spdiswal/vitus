import {
	type DummyModuleId,
	dummyParentIds,
	dummyVitestModule,
} from "+models/Module.fixtures"
import { type DummySuiteId, dummyVitestSuite } from "+models/Suite.fixtures"
import type { Test } from "+models/Test"
import type { OddDigit } from "+types/Digit"
import type { TestCase, TestState } from "vitest/node"

export function dummyTest(id: DummyTestId, overrides?: Partial<Test>): Test {
	const [parentModuleId, parentSuiteId] = dummyParentIds(id)

	return {
		type: "test",
		id,
		parentId: parentSuiteId ?? parentModuleId,
		parentModuleId,
		name: dummyTestName(id),
		status: "passed",
		...overrides,
	}
}

export function dummyVitestTest(
	id: DummyTestId,
	overrides?: Partial<{ status: TestState }>,
): TestCase {
	const [parentModuleId, parentSuiteId] = dummyParentIds(id)

	const parentModule = dummyVitestModule(parentModuleId)
	const parentSuite =
		parentSuiteId !== null ? dummyVitestSuite(parentSuiteId) : null

	return {
		type: "test",
		module: parentModule,
		parent: parentSuite ?? parentModule,
		id,
		name: dummyTestName(id),
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
	"3afdd8b6c3": {
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

export function dummyTestName(id: DummyTestId): string {
	const [moduleId] = dummyParentIds(id)
	const lastDigit = Number.parseInt(id.slice(-1)) as OddDigit

	return dummyNamesById[moduleId][lastDigit]
}
