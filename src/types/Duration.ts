/**
 * A timespan in milliseconds.
 */
export type Duration = number

export function formatDuration(duration: Duration): string {
	return `${Math.round(duration)} ms`
}
