import type { ClassString } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"
import { Svg } from "+utilities/Svg"

/**
 * Heroicons: `chevron-right` (outline variant)
 *
 * @see https://heroicons.com/outline
 */
export function ChevronRightIcon(props: {
	class: ClassString
	"stroke-width"?: string
	title?: string
}): Renderable {
	return (
		<Svg
			class={props.class}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width={props["stroke-width"] ?? "1.5"}
			title={props.title}
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="m8.25 4.5 7.5 7.5-7.5 7.5"
			/>
		</Svg>
	)
}
