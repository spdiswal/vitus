export function* concatIterables<Item>(
	a: Iterable<Item>,
	b: Iterable<Item>,
): Iterable<Item> {
	yield* a
	yield* b
}

/**
 * ECMAScript implements this function natively, but it is not supported by Node.js 20.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/filter
 */
export function* filterIterable<Item, NarrowedItem extends Item = Item>(
	items: Iterable<Item>,
	predicate: ((item: Item) => boolean) | ((item: Item) => item is NarrowedItem),
): Iterable<NarrowedItem> {
	for (const item of items) {
		if (predicate(item)) {
			yield item as NarrowedItem
		}
	}
}
