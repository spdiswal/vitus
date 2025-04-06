import type { DummyFileId } from "+api/models/FileDto.fixtures"
import {
	type DummySuiteId,
	getDummySuiteName,
} from "+api/models/SuiteDto.fixtures"
import type { TestDto } from "+api/models/TestDto"
import type { OddDigit } from "+types/Digit"

export function dummyTestDto(
	id: DummyTestId,
	overrides?: Partial<Omit<TestDto, "type" | "id">>,
): TestDto {
	const [parentFileId, ...parentSuiteIds] = getStructuredDummyTestId(id)
	parentSuiteIds.pop()

	return {
		type: "test",
		id,
		parentId: parentSuiteIds.at(-1) ?? parentFileId,
		parentFileId,
		fullName:
			parentSuiteIds.length > 1
				? [
						getDummySuiteName(parentSuiteIds[0]),
						...parentSuiteIds.slice(1).map(getDummySuiteName),
					]
				: [getDummyTestName(parentSuiteIds[0])],
		status: "passed",
		duration: 0,
		errors: [],
		...overrides,
	}
}

export type DummyTestId =
	| `${DummyFileId}_${OddDigit}` // Top-level test.
	| `${DummySuiteId}_${OddDigit}` // Nested test.

export type StructuredDummyTestId = [
	DummyFileId,
	...Array<DummySuiteId>,
	DummyTestId,
]

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

export function getDummyTestName(id: DummyTestId): string {
	const structuredId = getStructuredDummyTestId(id)

	const fileId = structuredId[0] as DummyFileId
	const testId = structuredId.at(-1) as DummyTestId
	const lastDigit = Number.parseInt(testId.slice(-1)) as OddDigit

	return `${structuredId.length === 2 ? "when" : "and"} ${dummyNamesById[fileId][lastDigit]}`
}

export function getStructuredDummyTestId(
	id: DummyTestId,
): StructuredDummyTestId {
	const segments = id.split("_")
	return segments.map(
		(_, index) => `${segments.slice(0, index + 1).join("_")}`,
	) as StructuredDummyTestId
}
