import type { FileDeletedDto } from "+api/events/FileDeletedDto"
import type { RunCompletedDto } from "+api/events/RunCompletedDto"
import type { RunStartedDto } from "+api/events/RunStartedDto"
import type { ServerDisconnectedDto } from "+api/events/ServerDisconnectedDto"
import type { ServerRestartedDto } from "+api/events/ServerRestartedDto"
import type { TaskUpdatedDto } from "+api/events/TaskUpdatedDto"

export type EventDto =
	| FileDeletedDto
	| RunCompletedDto
	| RunStartedDto
	| ServerDisconnectedDto
	| ServerRestartedDto
	| TaskUpdatedDto
