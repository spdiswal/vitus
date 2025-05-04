import type { Module } from "+api/models/Module"
import type { ModuleId } from "+api/models/ModuleId"
import type { Subtask } from "+api/models/Subtask"
import type { SubtaskId } from "+api/models/SubtaskId"
import type { TaskStatus } from "+api/models/TaskStatus"
import type { Path } from "+types/Path"

export type Project = {
	rootPath: Path
	isConnected: boolean
	status: TaskStatus
	modulesById: Readonly<Record<ModuleId, Module>>
	subtasksById: Readonly<Record<SubtaskId, Subtask>> // Suites and tests use a shared id namespace in Vitest (i.e. it is impossible to determine from an id alone whether it is a suite or test).
}
