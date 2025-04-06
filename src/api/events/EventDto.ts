import type { ModuleDeletedDto } from "+api/events/ModuleDeletedDto"
import type { RunCompletedDto } from "+api/events/RunCompletedDto"
import type { RunStartedDto } from "+api/events/RunStartedDto"
import type { ServerDisconnectedDto } from "+api/events/ServerDisconnectedDto"
import type { ServerRestartedDto } from "+api/events/ServerRestartedDto"
import type { TaskUpdatedDto } from "+api/events/TaskUpdatedDto"

export type EventDto =
	| ModuleDeletedDto
	| RunCompletedDto
	| RunStartedDto
	| ServerDisconnectedDto
	| ServerRestartedDto
	| TaskUpdatedDto
