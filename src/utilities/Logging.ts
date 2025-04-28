import type { HexColour } from "+types/HexColour"

export function logDebug(
	summary: {
		label: string
		labelColour: HexColour
		message: string
	},
	details: Record<number | string, unknown> = {},
): void {
	const labelAndMessage = `%c ${summary.label} %c ${summary.message.replace("%", "%%")}`
	const labelStyle = `display:inline-block;padding:3px;border-radius:6px;background-color:${summary.labelColour};color:white;text-transform:uppercase;`
	const messageStyle = "display:inline-block;padding:3px;"

	const detailsEntries = Object.entries(details)

	if (detailsEntries.length === 0) {
		console.debug(labelAndMessage, labelStyle, messageStyle)
	} else {
		console.groupCollapsed(labelAndMessage, labelStyle, messageStyle)
		for (const [key, value] of detailsEntries) {
			console.debug(`"${key}": ${JSON.stringify(value, null, 2)}`)
		}
		console.groupEnd()
	}
}
