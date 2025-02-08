import type { Renderable } from "+types/Renderable"
import type { StorybookMeta } from "+types/storybook/StorybookMeta"
import type { ComponentProps } from "preact"

export type StorybookStory<
	Component extends (props: ComponentProps<Component>) => Renderable,
> = Pick<StorybookMeta<Component>, "args" | "decorators">
