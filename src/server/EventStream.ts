import EventEmitter from "node:events"
import type { ServerEvent } from "+server/ServerEvent"

export type EventStream = EventEmitter<{ message: [ServerEvent] }>

export function createEventStream(): EventStream {
	return new EventEmitter()
}
