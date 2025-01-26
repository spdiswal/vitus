import type { FilePath } from "+types/FilePath"
import type { TestModule, TestSpecification } from "vitest/node"

export type RunEvent = {
	scope: "run"
	status: RunEventStatus
	filePaths: Array<FilePath>
}

export type RunEventStatus = "completed" | "started"

export function mapToRunEvent(
	modules: ReadonlyArray<TestModule | TestSpecification>,
	status: RunEventStatus,
): RunEvent {
	return {
		scope: "run",
		status,
		filePaths: modules.map((module) => module.moduleId),
	}
}
