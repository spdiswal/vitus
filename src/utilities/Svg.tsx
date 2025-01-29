import type { Renderable } from "+types/Renderable"

export function Svg(props: {
	class: string
	viewBox: `${number} ${number} ${number} ${number}`
	fill?: string
	stroke?: string
	strokeWidth?: string
	children: Renderable
}): Renderable {
	return (
		<svg
			class={props.class}
			viewBox={props.viewBox}
			fill={props.fill}
			stroke={props.stroke}
			strokeWidth={props.strokeWidth}
			height="1" // Workaround for Safari; use Tailwind CSS classes (e.g. `h-*` or `size-*`) to set the actual height.
			aria-hidden="true"
		>
			{props.children}
		</svg>
	)
}
