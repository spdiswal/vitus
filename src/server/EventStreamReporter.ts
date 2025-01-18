import type { EventStream } from "+server/EventStream"
import type { Reporter } from "vitest/reporters"

export function createEventStreamReporter(eventStream: EventStream): Reporter {
	return {
		onWatcherRerun(): void {
			eventStream.emit("message", "onWatcherRerun")
		},
		onPathsCollected(): void {
			eventStream.emit("message", "onPathsCollected")
		},
		onSpecsCollected(): void {
			eventStream.emit("message", "onSpecsCollected")
		},
		onTestModuleQueued(): void {
			eventStream.emit("message", "onTestModuleQueued")
		},
		onCollected(): void {
			eventStream.emit("message", "onCollected")
		},
		onTaskUpdate(): void {
			eventStream.emit("message", "onTaskUpdate")
		},
		onFinished(): void {
			eventStream.emit("message", "onFinished")
		},
		onWatcherStart(): void {
			eventStream.emit("message", "onWatcherStart")
		},
		//
		//
		//
		onTestRemoved(): void {
			// TODO: Lifecycle to be clarified.
			eventStream.emit("message", "onTestRemoved")
		},
		onServerRestart(): void {
			// TODO: Lifecycle to be clarified.
			eventStream.emit("message", "onServerRestart")
		},
		onUserConsoleLog(): void {
			// TODO: Lifecycle to be clarified.
			eventStream.emit("message", "onUserConsoleLog")
		},
		onProcessTimeout(): void {
			// TODO: Lifecycle to be clarified.
			eventStream.emit("message", "onProcessTimeout")
		},
	}
}
