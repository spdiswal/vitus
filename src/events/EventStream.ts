import EventEmitter from "node:events"
import type { ProjectEvent } from "+events/ProjectEvent"

export type EventStream = {
	send: (event: ProjectEvent | null) => void
	subscribe: (subscriber: EventStreamSubscriber) => void
	unsubscribe: (subscriber: EventStreamSubscriber) => void
}

export type EventStreamSubscriber = (event: ProjectEvent) => void

export function createEventStream(): EventStream {
	const emitter = new EventEmitter<{ message: [ProjectEvent] }>()

	return {
		send(event): void {
			if (event !== null) {
				emitter.emit("message", event)
			}
		},
		subscribe(subscriber): void {
			emitter.addListener("message", subscriber)
		},
		unsubscribe(subscriber): void {
			emitter.removeListener("message", subscriber)
		},
	}
}
