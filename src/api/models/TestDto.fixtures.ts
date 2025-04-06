import {
	type DummyModuleId,
	dummyParentIds,
} from "+api/models/ModuleDto.fixtures"
import type { DummySuiteId } from "+api/models/SuiteDto.fixtures"
import type { TestDto } from "+api/models/TestDto"
import type { OddDigit } from "+types/Digit"

export function dummyTestDto(
	id: DummyTestId,
	overrides?: Partial<Omit<TestDto, "type" | "id">>,
): TestDto {
	return {
		type: "test",
		id,
		parentId: id.slice(0, id.lastIndexOf("_")),
		moduleId: id.slice(0, id.indexOf("_")),
		name: getDummyTestName(id),
		status: "passed",
		duration: 0,
		errors: [],
		...overrides,
	}
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

export function getDummyTestName(id: DummyTestId): string {
	const [moduleId] = dummyParentIds(id)
	const lastDigit = Number.parseInt(id.slice(-1)) as OddDigit

	return dummyNamesById[moduleId][lastDigit]
}
