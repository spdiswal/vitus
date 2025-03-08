export function toSum(a: number, b: number): number {
	return a + b
}

/**
 * A type-narrowing predicate for `Array.filter()` that discards null and undefined elements.
 */
export function notNullish<Element>(
	element: Element | null | undefined,
): element is Element {
	return element !== null && element !== undefined
}
