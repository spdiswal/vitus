import { ExplorerFileTreeDirectory } from "+explorer/components/ExplorerFileTree/ExplorerFileTreeDirectory"
import { ExplorerFileTreeFile } from "+explorer/components/ExplorerFileTree/ExplorerFileTreeFile"
import type { FileTree } from "+explorer/state/FileTree"
import type { FilePath } from "+types/FilePath"
import type { Renderable } from "+types/Renderable"

export function ExplorerFileTree(props: {
	class?: string
	tree: FileTree
	onFileSelected: (filePath: FilePath) => void
}): Renderable {
	return (
		<ul class={props.class}>
			{props.tree.map((entry) => (
				<li key={entry.path} class="flex gap-x-1 my-1">
					{entry.type === "directory" ? (
						<ExplorerFileTreeDirectory
							directory={entry}
							onFileSelected={props.onFileSelected}
						/>
					) : (
						<ExplorerFileTreeFile
							file={entry}
							onFileSelected={props.onFileSelected}
						/>
					)}
				</li>
			))}
		</ul>
	)
}
