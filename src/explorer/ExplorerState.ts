import type { Event } from "+server/events/Event"
import { type Signal, useSignal, useSignalEffect } from "@preact/signals"

export type ExplorerState = {
	runnerStatus: "disconnected" | "idle" | "running"
	events: Array<Event>
}

export const initialExplorerState: ExplorerState = {
	runnerStatus: "idle",
	events: [],
}

export function useExplorerState(): Signal<ExplorerState> {
	const signal = useSignal(initialExplorerState)

	useSignalEffect(() => {
		const eventSource = new EventSource("/api/events")

		eventSource.addEventListener("message", (message) => {
			const event: Event = JSON.parse(message.data)
			signal.value = updateExplorerState(signal.value, event)
		})
		eventSource.addEventListener("error", () => {
			signal.value = { ...signal.value, runnerStatus: "disconnected" }
		})

		return function cleanUp(): void {
			eventSource.close()
		}
	})

	return signal
}

export function updateExplorerState(
	state: ExplorerState,
	event: Event,
): ExplorerState {
	const events = [...state.events, event]

	switch (event.scope) {
		case "run": {
			const runnerStatus = event.status === "started" ? "running" : "idle"
			return { ...state, runnerStatus, events }
		}
		default: {
			return { ...state, events }
		}
	}
}
