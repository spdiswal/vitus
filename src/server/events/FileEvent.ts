import type { FilePath } from "+types/FilePath"
import type { TestModule, TestModuleState } from "vitest/node"

export type FileEvent = {
	scope: "file"
	status: FileEventStatus
	filePath: FilePath
}

export type FileEventStatus =
	| "deleted"
	| "failed"
	| "registered"
	| "passed"
	| "skipped"
	| "started"

export function mapToFileEvent(
	module: TestModule,
	overrideStatus?: FileEventStatus,
): FileEvent {
	return {
		scope: "file",
		status: overrideStatus ?? mapStatus(module.state()),
		filePath: module.moduleId,
	}
}

function mapStatus(status: TestModuleState): FileEventStatus {
	switch (status) {
		case "pending": {
			return "started"
		}
		case "queued": {
			return "registered"
		}
		default:
			return status
	}
}

export function mapToDeletedFileEvent(filePath: string): FileEvent {
	return {
		scope: "file",
		status: "deleted",
		filePath,
	}
}
