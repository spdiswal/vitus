import { logEvent } from "+explorer/events/LogEvent"
import { useEventStream } from "+explorer/events/UseEventStream"
import type { NavigationEntries } from "+explorer/navigation/NavigationEntry"
import {
	type ExplorerState,
	mapNavigationEntriesToOverallStatus,
} from "+explorer/state/ExplorerState"
import type { Event } from "+server/events/Event"
import type { FileEvent } from "+server/events/FileEvent"
import type { RunEvent } from "+server/events/RunEvent"
import type { ServerEvent } from "+server/events/ServerEvent"
import type { SuiteEvent } from "+server/events/SuiteEvent"
import type { TestEvent } from "+server/events/TestEvent"
import { useCallback, useState } from "preact/hooks"

export function useExplorerState(initialState: ExplorerState): ExplorerState {
	const [state, setState] = useState(initialState)

	const handleEvent = useCallback((event: Event) => {
		setState((oldState) => applyEvent(oldState, event))
		logEvent(event)
	}, [])

	useEventStream(handleEvent)

	return state
}

function applyEvent(oldState: ExplorerState, event: Event): ExplorerState {
	switch (event.scope) {
		case "file": {
			return applyFileEvent(oldState, event)
		}
		case "run": {
			return applyRunEvent(oldState, event)
		}
		case "server": {
			return applyServerEvent(oldState, event)
		}
		case "suite": {
			return applySuiteEvent(oldState, event)
		}
		case "test": {
			return applyTestEvent(oldState, event)
		}
	}
}

function applyFileEvent(
	oldState: ExplorerState,
	event: FileEvent,
): ExplorerState {
	return {
		...oldState,
		navigationEntries: applyFileEventToNavigationEntries(
			oldState.navigationEntries,
			event,
		),
	}
}

// TODO: Update duration.
function applyFileEventToNavigationEntries(
	entries: NavigationEntries,
	event: FileEvent,
): NavigationEntries {
	const indexToUpdate = entries.findIndex(
		(entry) => entry.name === event.filePath,
	)

	if (indexToUpdate === -1) {
		return entries
	}

	const entryToUpdate = entries[indexToUpdate]

	switch (event.status) {
		case "registered":
		case "started": {
			return entries.toSpliced(indexToUpdate, 1, {
				...entryToUpdate,
				status: "commenced",
			})
		}
		case "failed": {
			return entries.toSpliced(indexToUpdate, 1, {
				...entryToUpdate,
				status: "failed",
			})
		}
		case "passed": {
			return entries.toSpliced(indexToUpdate, 1, {
				...entryToUpdate,
				status: "passed",
			})
		}
		case "skipped": {
			return entries.toSpliced(indexToUpdate, 1, {
				...entryToUpdate,
				status: "skipped",
			})
		}
		case "deleted": {
			return entries.toSpliced(indexToUpdate, 1)
		}
	}
}

function applyRunEvent(
	oldState: ExplorerState,
	event: RunEvent,
): ExplorerState {
	return {
		...oldState,
		overallStatus:
			event.status === "started"
				? "commenced"
				: mapNavigationEntriesToOverallStatus(oldState.navigationEntries),
	}
}

function applyServerEvent(
	oldState: ExplorerState,
	event: ServerEvent,
): ExplorerState {
	switch (event.status) {
		case "disconnected": {
			return { ...oldState, overallStatus: "disconnected" }
		}
		case "restarted": {
			return { overallStatus: "disconnected", navigationEntries: [] }
		}
	}
}

function applySuiteEvent(
	oldState: ExplorerState,
	_event: SuiteEvent,
): ExplorerState {
	return oldState
}

function applyTestEvent(
	oldState: ExplorerState,
	_event: TestEvent,
): ExplorerState {
	return oldState
}
