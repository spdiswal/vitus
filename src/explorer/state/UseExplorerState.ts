import { logEvent } from "+explorer/events/LogEvent"
import { useEventStream } from "+explorer/events/UseEventStream"
import {
	type ExplorerState,
	initialExplorerState,
} from "+explorer/state/ExplorerState"
import {
	createSingletonFileTree,
	deletePathInFileTree,
	mergeFileTrees,
} from "+explorer/state/FileTree"
import type { Event } from "+server/events/Event"
import type { FileEvent } from "+server/events/FileEvent"
import type { RunEvent } from "+server/events/RunEvent"
import type { ServerEvent } from "+server/events/ServerEvent"
import type { SuiteEvent } from "+server/events/SuiteEvent"
import type { TestEvent } from "+server/events/TestEvent"
import { useCallback, useState } from "preact/hooks"

export function useExplorerState(): ExplorerState {
	const [state, setState] = useState(initialExplorerState)

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
	switch (event.status) {
		case "deleted": {
			return {
				...oldState,
				fileTree: deletePathInFileTree(oldState.fileTree, event.filePath),
			}
		}
		default: {
			return {
				...oldState,
				fileTree: mergeFileTrees(
					oldState.fileTree,
					createSingletonFileTree(event.filePath, event.status),
				),
			}
		}
	}
}

function applyRunEvent(
	oldState: ExplorerState,
	event: RunEvent,
): ExplorerState {
	return { ...oldState, status: event.status }
}

function applyServerEvent(
	oldState: ExplorerState,
	event: ServerEvent,
): ExplorerState {
	switch (event.status) {
		case "disconnected": {
			return { ...oldState, status: "disconnected" }
		}
		case "restarted": {
			return { ...oldState, status: "disconnected", fileTree: [] }
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
