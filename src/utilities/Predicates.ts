export function not<Value>(
	predicate: (value: Value) => boolean,
): (value: Value) => boolean {
	return (value): boolean => !predicate(value)
}
