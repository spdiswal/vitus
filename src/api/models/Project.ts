import type { Module } from "+api/models/Module"
import type { ModuleId } from "+api/models/ModuleId"
import type { ProjectStatus } from "+api/models/ProjectStatus"
import type { Subtask } from "+api/models/Subtask"
import type { SubtaskId } from "+api/models/SubtaskId"
import type { Path } from "+types/Path"

export type Project = {
	rootPath: Path
	status: ProjectStatus
	modulesById: Readonly<Record<ModuleId, Module>>
	subtasksById: Readonly<Record<SubtaskId, Subtask>> // Suites and tests use a shared id namespace in Vitest (i.e. it is impossible to determine from an id alone whether it is a suite or test).
}
