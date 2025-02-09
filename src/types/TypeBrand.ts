declare const discriminator: unique symbol

/**
 * The `UniqueTag` prevents type aliases from being assignable to each other even if they have the same structural type.
 * The discriminator property is inaccessible, as it is computed from a non-exported unique symbol.
 * It is marked as optional to allow implicit type conversion from literal values.
 *
 * @see https://spin.atomicobject.com/2018/01/15/typescript-flexible-nominal-typing
 */
export type TypeBrand<UniqueTag extends string> = {
	readonly [discriminator]?: UniqueTag
}
