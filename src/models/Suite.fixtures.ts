import {
	type DummyModuleId,
	dummyParentIds,
	dummyVitestModule,
} from "+models/Module.fixtures"
import type { Suite } from "+models/Suite"
import type { EvenDigit } from "+types/Digit"
import type { TestCase, TestSuite, TestSuiteState } from "vitest/node"

export function dummySuite(
	id: DummySuiteId,
	overrides?: Partial<Suite>,
): Suite {
	const [parentModuleId, parentSuiteId] = dummyParentIds(id)

	return {
		type: "suite",
		id,
		parentId: parentSuiteId ?? parentModuleId,
		parentModuleId,
		name: dummySuiteName(id),
		status: "passed",
		...overrides,
	}
}

export function dummyVitestSuite(
	id: DummySuiteId,
	overrides?: Partial<{
		status: TestSuiteState
	}>,
): TestSuite {
	const [parentModuleId, parentSuiteId] = dummyParentIds(id)

	const parentModule = dummyVitestModule(parentModuleId)
	const parentSuite =
		parentSuiteId !== null ? dummyVitestSuite(parentSuiteId) : null

	return {
		type: "suite",
		module: parentModule,
		parent: parentSuite ?? parentModule,
		id,
		name: dummySuiteName(id),
		state: () => overrides?.status ?? "pending",
		children: {
			allTests(): Iterable<TestCase> {
				return []
			},
		},
	} as TestSuite
}

export type DummySuiteId =
	| `${DummyModuleId}_${EvenDigit}` // Top-level suite.
	| `${DummyModuleId}_${EvenDigit}_${EvenDigit}` // Nested suite (level 1).
	| `${DummyModuleId}_${EvenDigit}_${EvenDigit}_${EvenDigit}` // Nested suite (level 2).

const dummyNamesById: Record<DummyModuleId, Record<EvenDigit, string>> = {
	"15b021ef72": {
		0: "the fruit basket has no apples",
		2: "the spring break is over",
		4: "the music starts playing",
		6: "the fridge is out of apple juice",
		8: "travelling through time",
	},
	"3afdd8b6c3": {
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

export function dummySuiteName(id: DummySuiteId): string {
	const [moduleId, parentSuiteId] = dummyParentIds(id)
	const lastDigit = Number.parseInt(id.slice(-1)) as EvenDigit

	return `${parentSuiteId === null ? "when" : "and"} ${dummyNamesById[moduleId][lastDigit]}`
}
