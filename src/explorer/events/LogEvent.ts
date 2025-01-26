import type { Event } from "+server/events/Event"
import type { HexColour } from "+types/HexColour"

export function logEvent(event: Event): void {
	const label = `${event.scope} ${event.status}`
	const labelColour = getLabelHexColour(event)
	const summary = getSummary(event)

	// biome-ignore lint/suspicious/noConsole: This statement is only reachable in development mode.
	console.groupCollapsed(
		`%c ${label} %c ${summary.replace("%", "%%")}`,
		`display:inline-block;padding:3px;border-radius:6px;background-color:${labelColour};color:white;text-transform:uppercase;`,
		"display:inline-block;padding:3px",
	)

	// biome-ignore lint/suspicious/noConsole: This statement is only reachable in development mode.
	console.debug(JSON.stringify(event, null, 2))

	// biome-ignore lint/suspicious/noConsole: This statement is only reachable in development mode.
	console.groupEnd()
}

function getLabelHexColour(event: Event): HexColour {
	switch (event.status) {
		case "completed": {
			return "#1d4ed8"
		}
		case "deleted":
		case "registered":
		case "restarted":
		case "skipped":
		case "started": {
			return "#374151"
		}
		case "disconnected": {
			return "#b45309"
		}
		case "failed": {
			return "#b91c1c"
		}
		case "passed": {
			return "#15803d"
		}
	}
}

function getSummary(event: Event): string {
	switch (event.scope) {
		case "file": {
			return event.filePath
		}
		case "run": {
			return ""
		}
		case "server": {
			return ""
		}
		case "suite": {
			return event.suiteName
		}
		case "test": {
			return event.testName
		}
	}
}
