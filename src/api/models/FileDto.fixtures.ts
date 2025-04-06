import type { FileDto } from "+api/models/FileDto"
import type { DummySuiteId } from "+api/models/SuiteDto.fixtures"
import type { DummyTestId } from "+api/models/TestDto.fixtures"

export function dummyFileDto(
	id: DummyFileId,
	overrides?: Partial<Omit<FileDto, "type" | "id">>,
): FileDto {
	return {
		type: "file",
		id,
		path: dummyFilePath(id),
		status: "passed",
		duration: 1,
		errors: [],
		...overrides,
	}
}

export type DummyFileId =
	| "15b021ef72"
	| "a3fdd8b6c3"
	| "-1730f876b4"
	| "-e45b128829"

const dummyPathsById: Record<DummyFileId, string> = {
	"15b021ef72":
		"/Users/spdiswal/repositories/plantation/src/orchard/Apples.tests.ts",
	a3fdd8b6c3:
		"/Users/spdiswal/repositories/plantation/src/shipping/Bananas.tests.ts",
	"-1730f876b4":
		"/Users/spdiswal/repositories/plantation/src/basket/Oranges.tests.ts",
	"-e45b128829":
		"/Users/spdiswal/repositories/plantation/src/supermarket/Peaches.tests.ts",
}

export function dummyFilePath(fileId: DummyFileId): string {
	return dummyPathsById[fileId]
}

export function dummyParentIds(
	id: DummySuiteId | DummyTestId,
): [DummyFileId, DummySuiteId | null] {
	const parentFileId = id.slice(0, id.indexOf("_"))
	const parentSuiteId = id.slice(0, id.lastIndexOf("_"))

	return [
		parentFileId as DummyFileId,
		parentSuiteId !== parentFileId ? (parentSuiteId as DummySuiteId) : null,
	]
}
