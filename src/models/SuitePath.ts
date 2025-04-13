import type { ModuleId } from "+models/Module"
import type { SuiteId, SuiteIds } from "+models/Suite"

export type SuitePath = [ModuleId, ...SuiteIds, SuiteId]

export function getSuiteIdFromSuitePath(path: SuitePath): SuiteId {
	return path.at(-1) as SuiteId
}
