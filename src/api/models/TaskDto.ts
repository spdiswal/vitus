import type { FileDto } from "+api/models/FileDto"
import type { SubtaskDto } from "+api/models/SubtaskDto"

export type TaskDto = FileDto | SubtaskDto
