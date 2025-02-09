import { ExplorerFileTreeDirectory } from "+explorer/components/ExplorerFileTree/ExplorerFileTreeDirectory"
import { ExplorerFileTreeFile } from "+explorer/components/ExplorerFileTree/ExplorerFileTreeFile"
import type { FileTree } from "+explorer/state/FileTree"
import { type ClassString, cn } from "+types/ClassString"
import type { FilePath } from "+types/FilePath"
import type { Renderable } from "+types/Renderable"

export function ExplorerFileTree(props: {
	class?: ClassString
	tree: FileTree
	onFileSelected: (filePath: FilePath) => void
}): Renderable {
	return (
		<ul class={cn(props.class)}>
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
