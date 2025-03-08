import type { TypeBrand } from "+types/TypeBrand"
import type { KeysOfType } from "+utilities/Objects"

export type Computed<Value> = ComputedBrand & Value

export type PickNonComputed<Value extends object> = Omit<
	Value,
	ComputedKeysOf<Value>
>

export type ComputedKeysOf<Value extends object> = KeysOfType<
	Value,
	ComputedBrand
>

type ComputedBrand = TypeBrand<"Computed">
