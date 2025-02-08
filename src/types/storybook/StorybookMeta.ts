import type { Renderable } from "+types/Renderable"
import type { Decorator } from "@storybook/preact"
import type { ComponentProps } from "preact"

export type StorybookMeta<
	Component extends (props: ComponentProps<Component>) => Renderable,
> = {
	component: Component
	args?: Partial<ComponentProps<Component>>
	decorators?: Array<Decorator>
}
