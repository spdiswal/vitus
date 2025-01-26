import EventEmitter from "node:events"
import type { Event } from "+server/events/Event"

export type EventStream = {
	send: (event: Event) => void
	subscribe: (subscriber: EventStreamSubscriber) => void
	unsubscribe: (subscriber: EventStreamSubscriber) => void
}

export type EventStreamSubscriber = (event: Event) => void

export function createEventStream(): EventStream {
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
