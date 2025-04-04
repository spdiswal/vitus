export function toSum(a: number, b: number): number {
	return a + b
}

/**
 * A type-narrowing predicate for `Array.filter()` that discards null and undefined items.
 */
export function notNullish<Item>(item: Item | null | undefined): item is Item {
	return item !== null && item !== undefined
}

/**
 * Returns `true` if the given arrays have the same length and the same sequence of referentially equal items;
 * or `false` if the arrays are not shallowly equal.
 */
export function arrayEquals<Item>(
	a: ReadonlyArray<Item>,
	b: ReadonlyArray<Item>,
): boolean {
	return a.length === b.length && a.every((item, index) => item === b[index])
}
