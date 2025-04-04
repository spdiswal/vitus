export type NonEmptyArray<Item> = [Item, ...Array<Item>]

/**
 * Returns `true` if the given array contains at least one item;
 * or `false` if the array is empty.
 */
export function isNonEmptyArray<Item>(
	array: Array<Item>,
): array is NonEmptyArray<Item> {
	return array.length > 0
}
