import type { FileDto } from "+api/models/FileDto"
import type { SubtaskDto } from "+api/models/SubtaskDto"
import type { RootPath } from "+explorer/models/RootPath"
import type { RootStatus } from "+explorer/models/RootStatus"

export type InitialStateDto = {
	rootPath: RootPath
	rootStatus: RootStatus
	files: Array<FileDto>
	subtasks: Array<SubtaskDto>
}
