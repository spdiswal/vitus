import type { ClassString } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"
import { Svg } from "+utilities/Svg"

/**
 * Heroicons: `folder` (outline variant)
 *
 * @see https://heroicons.com/outline
 */
export function FolderIcon(props: {
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
				d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
			/>
		</Svg>
	)
}
