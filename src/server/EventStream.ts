import EventEmitter from "node:events"
import type { EventDto } from "+api/events/EventDto"

export type EventStream = {
	send: (event: EventDto) => void
	subscribe: (subscriber: EventStreamSubscriber) => void
	unsubscribe: (subscriber: EventStreamSubscriber) => void
}

export type EventStreamSubscriber = (event: EventDto) => void

export function newEventStream(): EventStream {
	const emitter = new EventEmitter<{ message: [EventDto] }>()

	return {
		send(event): void {
			emitter.emit("message", event)
		},
		subscribe(subscriber): void {
			emitter.addListener("message", subscriber)
		},
		unsubscribe(subscriber): void {
			emitter.removeListener("message", subscriber)
		},
	}
}
