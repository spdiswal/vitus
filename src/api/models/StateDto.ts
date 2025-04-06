import type { ModuleDto } from "+api/models/ModuleDto"
import type { SubtaskDto } from "+api/models/SubtaskDto"
import type { RootPath } from "+explorer/models/RootPath"
import type { RootStatus } from "+explorer/models/RootStatus"

export type StateDto = {
	rootPath: RootPath
	rootStatus: RootStatus
	modules: Array<ModuleDto>
	subtasks: Array<SubtaskDto>
}
