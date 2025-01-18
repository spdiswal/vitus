import type { ServerEvent } from "+server/ServerEvent"
import { type Signal, useSignal, useSignalEffect } from "@preact/signals"

export type ExplorerState = {
	runnerStatus: "disconnected" | "idle" | "running"
	events: Array<string>
}

export const initialExplorerState: ExplorerState = {
	runnerStatus: "idle",
	events: [],
}

export function useExplorerState(): Signal<ExplorerState> {
	const signal = useSignal(initialExplorerState)

	useSignalEffect(() => {
		const eventSource = new EventSource("/api/events")

		eventSource.addEventListener("message", (event) => {
			signal.value = updateExplorerState(signal.value, event.data)
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
	event: ServerEvent,
): ExplorerState {
	const events = [...state.events, event]

	switch (event) {
		case "onWatcherRerun": {
			return { ...state, runnerStatus: "running", events }
		}
		case "onWatcherStart": {
			return { ...state, runnerStatus: "idle", events }
		}
		default: {
			return { ...state, events }
		}
	}
}
