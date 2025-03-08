import type { HexColour } from "+types/HexColour"

export function logDebug(
	summary: {
		label: string
		labelColour: HexColour
		message: string
	},
	details: object,
): void {
	console.groupCollapsed(
		`%c ${summary.label} %c ${summary.message.replace("%", "%%")}`,
		`display:inline-block;padding:3px;border-radius:6px;background-color:${summary.labelColour};color:white;text-transform:uppercase;`,
		"display:inline-block;padding:3px;",
	)
	for (const [key, value] of Object.entries(details)) {
		console.debug(`"${key}": ${JSON.stringify(value, null, 2)}`)
	}
	console.groupEnd()
}
