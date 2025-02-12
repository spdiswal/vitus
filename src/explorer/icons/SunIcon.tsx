import type { ClassString } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"
import { Svg } from "+utilities/Svg"

/**
 * Heroicons: `sun` (outline variant)
 *
 * @see https://heroicons.com/outline
 */
export function SunIcon(props: {
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
				d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
			/>
		</Svg>
	)
}
