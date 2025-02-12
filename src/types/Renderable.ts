import type { VNode } from "preact"

export type Renderable =
	| VNode
	| number
	| string
	| null
	| Array<VNode | number | string | null>
