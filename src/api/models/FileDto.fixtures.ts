import type { FileDto } from "+api/models/FileDto"

export function dummyFileDto(
	id: DummyFileId,
	overrides?: Partial<Omit<FileDto, "type" | "id">>,
): FileDto {
	return {
		type: "file",
		id,
		path: getDummyFilePath(id),
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

export function getDummyFilePath(fileId: DummyFileId): string {
	return dummyPathsById[fileId]
}
