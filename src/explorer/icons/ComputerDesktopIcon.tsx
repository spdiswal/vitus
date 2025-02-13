import type { ClassString } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"
import { Svg } from "+utilities/Svg"

/**
 * Heroicons: `computer-desktop` (outline variant)
 *
 * @see https://heroicons.com/outline
 */
export function ComputerDesktopIcon(props: {
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
				d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
			/>
		</Svg>
	)
}
