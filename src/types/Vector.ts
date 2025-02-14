/**
 * A tuple type of `Item` repeated `Size` times, where `Size` is a non-negative integer.
 * If `Size` is a union of non-negative integers, it produces a corresponding union of tuples.
 *
 * @see https://github.com/microsoft/TypeScript/issues/26223#issuecomment-674500430
 */
export type Vector<Item, Size extends number> = Size extends Size
	? number extends Size
		? Array<Item>
		: AppendItemToTuple<Item, Size, []>
	: never

type AppendItemToTuple<
	Item,
	Size extends number,
	Accumulator extends Array<unknown>,
> = Accumulator["length"] extends Size
	? Accumulator
	: AppendItemToTuple<Item, Size, [Item, ...Accumulator]>
