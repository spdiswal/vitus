import type { ProjectEvent } from "+events/ProjectEvent"
import { serverDisconnectedEvent } from "+events/server/ServerDisconnectedEvent"
import { useEffect } from "preact/hooks"

export function useEventStream(
	subscriber: (event: ProjectEvent) => void,
): void {
	useEffect(() => {
		const eventSource = new EventSource("/api/events")

		eventSource.addEventListener("message", (message) => {
			subscriber(JSON.parse(message.data))
		})
		eventSource.addEventListener("error", () => {
			subscriber(serverDisconnectedEvent())
		})

		return function cleanUp(): void {
			eventSource.close()
		}
	}, [subscriber])
}
