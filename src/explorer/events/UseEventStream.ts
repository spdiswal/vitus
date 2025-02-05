import type { Event } from "+server/events/Event"
import { useEffect } from "preact/hooks"

export function useEventStream(subscriber: (event: Event) => void): void {
	useEffect(() => {
		const eventSource = new EventSource("/api/events")

		eventSource.addEventListener("message", (message) => {
			const event: Event = JSON.parse(message.data)
			subscriber(event)
		})
		eventSource.addEventListener("error", () => {
			const event: Event = { scope: "server", status: "disconnected" }
			subscriber(event)
		})

		return function cleanUp(): void {
			eventSource.close()
		}
	}, [subscriber])
}
