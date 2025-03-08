import type { FileId } from "+models/File"
import type { SuiteId, SuiteIds } from "+models/Suite"
import type { SuitePath } from "+models/SuitePath"
import type { TestId } from "+models/Test"

export type TestPath = [FileId, ...SuiteIds, TestId]

export function getTestIdFromTestPath(path: TestPath): TestId {
	return path.at(-1) as TestId
}

export function getParentSuitePath(path: TestPath): SuitePath | null {
	return hasParentSuite(path) ? (path.slice(0, -1) as SuitePath) : null
}

function hasParentSuite(
	testPath: TestPath,
): testPath is [FileId, ...SuiteIds, SuiteId, TestId] {
	return testPath.length > 2
}
