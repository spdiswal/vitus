import type { FileId } from "+models/File"
import type { SuiteId, SuiteIds } from "+models/Suite"

export type SuitePath = [FileId, ...SuiteIds, SuiteId]

export function getSuiteIdFromSuitePath(path: SuitePath): SuiteId {
	return path.at(-1) as SuiteId
}
