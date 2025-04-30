import type { Event, Events } from "+api/events/Event"
import { serverDisconnected } from "+api/events/ServerDisconnected"
import type { Duration } from "+types/Duration"
import type { Timer } from "+utilities/Timers"
import { useCallback, useEffect, useRef } from "preact/hooks"

export function useBatchedEventStream(
	subscriber: (events: Events) => void,
	interval: Duration,
): void {
	const eventQueue = useRef<Events>([])
	const timer = useRef<Timer | null>(null)

	const flushEventQueue = useCallback(() => {
		subscriber(eventQueue.current)
		eventQueue.current = []
		timer.current = null
	}, [subscriber])

	const enqueueEvent = useCallback(
		(event: Event) => {
			eventQueue.current.push(event)
			timer.current ??= setTimeout(flushEventQueue, interval)
		},
		[flushEventQueue, interval],
	)

	useEffect(() => {
		const eventSource = new EventSource("/api/events")

		eventSource.addEventListener("message", (message) => {
			enqueueEvent(JSON.parse(message.data))
		})
		eventSource.addEventListener("error", () => {
			enqueueEvent(serverDisconnected())
		})

		return function cleanUp(): void {
			eventSource.close()
			clearTimeout(timer.current ?? undefined)
		}
	}, [enqueueEvent])
}
