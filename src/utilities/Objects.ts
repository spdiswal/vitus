/**
 * Returns an iterable of all entries in the given record object.
 */
export function* enumerateObjectEntries<Key extends number | string, Value>(
	record: Record<Key, Value>,
): Iterable<[Key, Value]> {
	for (const key in record) {
		if (Object.hasOwn(record, key)) {
			yield [key, record[key]]
		}
	}
}

/**
 * Returns an iterable of all values in the given record object.
 */
export function* enumerateObjectValues<Key extends number | string, Value>(
	record: Record<Key, Value>,
): Iterable<Value> {
	for (const key in record) {
		if (Object.hasOwn(record, key)) {
			yield record[key]
		}
	}
}

/**
 * Returns a copy of the given record object containing only the entries whose values satisfy the given predicate.
 *
 * For large records, it is more memory-efficient than `Object.fromEntries(Object.entries().filter())`, as it does not construct an intermediate array of entries.
 */
export function filterObjectByValue<Value>(
	record: Record<string, Value>,
	predicate: (value: Value) => boolean,
): Record<string, Value> {
	const result: Record<string, Value> = {}

	for (const key in record) {
		if (Object.hasOwn(record, key)) {
			const value = record[key] as Value // `Object.hasOwn()` guarantees that `record[key]` exists.

			if (predicate(value)) {
				result[key] = value
			}
		}
	}

	return result
}

/**
 * Returns a copy of the given record object with the given transformation function applied to every value.
 *
 * For large records, it is more memory-efficient than `Object.fromEntries(Object.entries().map())`, as it does not construct an intermediate array of entries.
 */
export function mapObjectByValue<Key extends number | string, Input, Output>(
	record: Record<Key, Input>,
	transform: (input: Input) => Output,
): Record<Key, Output> {
	const result = {} as Record<Key, Output>

	for (const key in record) {
		if (Object.hasOwn(record, key)) {
			result[key] = transform(record[key])
		}
	}

	return result
}
