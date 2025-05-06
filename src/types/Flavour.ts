declare const __flavour: unique symbol

/**
 * @see https://spin.atomicobject.com/2018/01/15/typescript-flexible-nominal-typing
 */
export type Flavour<Name extends string> = {
	[__flavour]?: Name
}
