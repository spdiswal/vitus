import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function Svg(props: {
	class: ClassString
	viewBox: `${number} ${number} ${number} ${number}`
	fill?: string
	stroke?: string
	"stroke-width"?: string
	title?: string
	children: Renderable
}): Renderable {
	return (
		<svg
			class={cn(props.class)}
			viewBox={props.viewBox}
			fill={props.fill}
			stroke={props.stroke}
			stroke-width={props["stroke-width"]}
			height="1" // Workaround for Safari; use Tailwind CSS classes (e.g. `h-*` or `size-*`) to set the actual height.
			aria-hidden="true"
		>
			{props.title !== undefined ? <title>{props.title}</title> : null}
			{props.children}
		</svg>
	)
}
