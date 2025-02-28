export function toSum(a: number, b: number): number {
	return a + b
}

export type LastItemOf<Items extends [unknown, ...Array<unknown>]> =
	Items extends [...infer _, infer LastItem] ? LastItem : never
