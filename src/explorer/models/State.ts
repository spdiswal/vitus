import type { StateDto } from "+api/models/StateDto"
import { initialiseModules } from "+explorer/models/Module"
import { setRootPath } from "+explorer/models/RootPath"
import { setRootStatus } from "+explorer/models/RootStatus"
import { initialiseSubtasks } from "+explorer/models/Subtask"

export function initialiseState(dto: StateDto): void {
	setRootPath(dto.rootPath)
	setRootStatus(dto.rootStatus)
	initialiseModules(dto.modules)
	initialiseSubtasks(dto.subtasks)
}
