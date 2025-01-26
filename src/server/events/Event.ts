import type { FileEvent } from "+server/events/FileEvent"
import type { RunEvent } from "+server/events/RunEvent"
import type { ServerEvent } from "+server/events/ServerEvent"
import type { SuiteEvent } from "+server/events/SuiteEvent"
import type { TestEvent } from "+server/events/TestEvent"

export type Event = FileEvent | RunEvent | ServerEvent | SuiteEvent | TestEvent
