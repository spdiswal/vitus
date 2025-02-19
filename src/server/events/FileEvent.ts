import type { Path } from "+types/Path"
import type { TestModule, TestModuleState } from "vitest/node"

export type FileEvent = {
	scope: "file"
	status: FileEventStatus
	filePath: Path
}

export type FileEventStatus =
	| "deleted"
	| "failed"
	| "registered"
	| "passed"
	| "skipped"
	| "started"

const statusMap = {
	failed: "failed",
	passed: "passed",
	pending: "started",
	queued: "registered",
	skipped: "skipped",
} as const satisfies Record<TestModuleState, FileEventStatus>

export function mapToFileEvent(
	module: TestModule,
	overrideStatus?: FileEventStatus,
): FileEvent {
	return {
		scope: "file",
		status: overrideStatus ?? statusMap[module.state()],
		filePath: module.moduleId,
	}
}

export function mapToDeletedFileEvent(filePath: string): FileEvent {
	return {
		scope: "file",
		status: "deleted",
		filePath,
	}
}
