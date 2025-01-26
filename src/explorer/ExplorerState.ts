import { logEvent } from "+explorer/events/LogEvent"
import { useEventStream } from "+explorer/events/UseEventStream"
import type { Event } from "+server/events/Event"
import { type Signal, useSignal } from "@preact/signals"

export type ExplorerState = {
	status: "disconnected" | "idle" | "running"
}

export const initialExplorerState: ExplorerState = {
	status: "idle",
}

export function useExplorerState(): Signal<ExplorerState> {
	const signal = useSignal(initialExplorerState)

	useEventStream((event) => {
		signal.value = updateExplorerState(signal.value, event)
		logEvent(event)
	})

	return signal
}

export function updateExplorerState(
	state: ExplorerState,
	event: Event,
): ExplorerState {
	switch (event.scope) {
		case "run": {
			return {
				...state,
				status: event.status === "started" ? "running" : "idle",
			}
		}
		case "server": {
			return {
				...state,
				status: event.status === "disconnected" ? "disconnected" : state.status,
			}
		}
		default: {
			return { ...state }
		}
	}
}
