import { type DummyModuleId, dummyParentIds } from "+api/models/Module.fixtures"
import type { Suite } from "+api/models/Suite"
import { passed } from "+api/models/TaskStatus"
import type { EvenDigit } from "+types/Digit"

export function dummySuite(
	suiteId: DummySuiteId,
	overrides?: Partial<Suite>,
): Suite {
	const [parentModuleId, parentSuiteId] = dummyParentIds(suiteId)

	return {
		type: "suite",
		id: suiteId,
		parentId: parentSuiteId ?? parentModuleId,
		parentModuleId,
		name: dummySuiteName(suiteId),
		status: passed(2),
		...overrides,
	}
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

export function dummySuiteName(suiteId: DummySuiteId): string {
	const [moduleId, parentSuiteId] = dummyParentIds(suiteId)
	const lastDigit = Number.parseInt(suiteId.slice(-1)) as EvenDigit

	return `${parentSuiteId === null ? "when" : "and"} ${dummyNamesById[moduleId][lastDigit]}`
}
