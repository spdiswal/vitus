import EventEmitter from "node:events"
import type { Event } from "+api/events/Event"

export type EventStream = {
	send: (event: Event) => void
	subscribe: (subscriber: EventStreamSubscriber) => void
	unsubscribe: (subscriber: EventStreamSubscriber) => void
}

export type EventStreamSubscriber = (event: Event) => void

export function newEventStream(): EventStream {
	const emitter = new EventEmitter<{ message: [Event] }>()

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
