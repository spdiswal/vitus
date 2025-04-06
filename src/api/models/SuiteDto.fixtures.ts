import type { DummyFileId } from "+api/models/FileDto.fixtures"
import type { SuiteDto } from "+api/models/SuiteDto"
import type { EvenDigit } from "+types/Digit"

export function dummySuiteDto(
	id: DummySuiteId,
	overrides?: Partial<Omit<SuiteDto, "type" | "id">>,
): SuiteDto {
	const [parentFileId, ...parentSuiteIds] = getStructuredDummySuiteId(id)
	parentSuiteIds.pop()

	return {
		type: "suite",
		id,
		parentId: parentSuiteIds.at(-1) ?? parentFileId,
		parentFileId,
		fullName: [...parentSuiteIds.map(getDummySuiteName), getDummySuiteName(id)],
		status: "passed",
		duration: 1,
		errors: [],
		...overrides,
	}
}

export type DummySuiteId =
	| `${DummyFileId}_${EvenDigit}` // Top-level suite.
	| `${DummyFileId}_${EvenDigit}_${EvenDigit}` // Nested suite (level 1).
	| `${DummyFileId}_${EvenDigit}_${EvenDigit}_${EvenDigit}` // Nested suite (level 2).

export type StructuredDummySuiteId = [
	DummyFileId,
	...Array<DummySuiteId>,
	DummySuiteId,
]

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

export function getDummySuiteName(id: DummySuiteId): string {
	const structuredId = getStructuredDummySuiteId(id)

	const fileId = structuredId[0] as DummyFileId
	const suiteId = structuredId.at(-1) as DummySuiteId
	const lastDigit = Number.parseInt(suiteId.slice(-1)) as EvenDigit

	return `${structuredId.length === 2 ? "when" : "and"} ${dummyNamesById[fileId][lastDigit]}`
}

export function getStructuredDummySuiteId(
	id: DummySuiteId,
): StructuredDummySuiteId {
	const segments = id.split("_")
	return segments.map(
		(_, index) => `${segments.slice(0, index + 1).join("_")}`,
	) as StructuredDummySuiteId
}
