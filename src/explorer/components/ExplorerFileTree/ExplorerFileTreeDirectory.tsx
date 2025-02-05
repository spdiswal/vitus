import { ExplorerFileTree } from "+explorer/components/ExplorerFileTree/ExplorerFileTree"
import type { FileTreeDirectory } from "+explorer/state/FileTree"
import { FolderIcon } from "+icons/FolderIcon"
import { FolderOpenIcon } from "+icons/FolderOpenIcon"
import type { FilePath } from "+types/FilePath"
import type { Renderable } from "+types/Renderable"
import { useState } from "preact/hooks"

export function ExplorerFileTreeDirectory(props: {
	directory: FileTreeDirectory
	onFileSelected: (filePath: FilePath) => void
}): Renderable {
	const [expanded, setExpanded] = useState(true)

	const directoryName = props.directory.path.slice(
		props.directory.path.slice(0, -1).lastIndexOf("/") + 1,
		-1,
	)

	return (
		<div class="w-full">
			<button
				type="button"
				class={`w-full flex gap-x-2 items-center cursor-pointer transition ${expanded ? "text-gray-300 hover:text-gray-50" : "text-gray-500 hover:text-gray-200"} hover:translate-x-1`}
				onClick={(): void => {
					setExpanded((oldExpanded) => !oldExpanded)
				}}
			>
				<span
					class={`size-6 transition ${expanded ? "scale-100" : "scale-85"}`}
				>
					{expanded ? (
						<FolderOpenIcon class="size-full" />
					) : (
						<FolderIcon class="size-full" />
					)}
				</span>
				{directoryName}
			</button>
			<ExplorerFileTree
				class={`w-full pl-3 ${expanded ? "block" : "hidden"}`}
				tree={props.directory.children}
				onFileSelected={props.onFileSelected}
			/>
		</div>
	)
}
