import type { EventDto } from "+api/events/EventDto"
import { serverDisconnected } from "+api/events/ServerDisconnectedDto"
import type { Duration } from "+types/Duration"
import type { Timer } from "+utilities/Timers"
import { batch, untracked, useSignalEffect } from "@preact/signals"
import { useRef } from "preact/hooks"

export function useBatchedEventStream(
	subscriber: (events: Array<EventDto>) => void,
	interval: Duration,
): void {
	const eventQueue = useRef<Array<EventDto>>([])
	const timer = useRef<Timer | null>(null)

	useSignalEffect(() => {
		const eventSource = new EventSource("/api/events")

		eventSource.addEventListener("message", (message) => {
			enqueueEvent(JSON.parse(message.data))
		})
		eventSource.addEventListener("error", () => {
			enqueueEvent(serverDisconnected())
		})

		function enqueueEvent(event: EventDto): void {
			eventQueue.current.push(event)
			timer.current ??= setTimeout(flushEventQueue, interval)
		}

		function flushEventQueue(): void {
			batch(() => {
				untracked(() => {
					subscriber(eventQueue.current)
				})
			})
			eventQueue.current = []
			timer.current = null
		}

		return function cleanUp(): void {
			eventSource.close()
			clearTimeout(timer.current ?? undefined)
		}
	})
}
