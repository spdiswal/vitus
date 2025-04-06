import type { StateDto } from "+api/models/StateDto"
import { initialiseFiles } from "+explorer/models/File"
import { setRootPath } from "+explorer/models/RootPath"
import { setRootStatus } from "+explorer/models/RootStatus"
import { initialiseSubtasks } from "+explorer/models/Subtask"

export function initialiseState(dto: StateDto): void {
	setRootPath(dto.rootPath)
	setRootStatus(dto.rootStatus)
	initialiseFiles(dto.files)
	initialiseSubtasks(dto.subtasks)
}
