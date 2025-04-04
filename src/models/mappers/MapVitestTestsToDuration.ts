import type { VitestTest } from "+models/mappers/MapVitestTestToSerialisableTest"
import type { Duration } from "+types/Duration"

export function mapVitestTestsToDuration(
	tests: Iterable<VitestTest>,
): Duration {
	let sum = 0

	for (const test of tests) {
		sum += test.diagnostic()?.duration ?? 0
	}

	return sum
}
