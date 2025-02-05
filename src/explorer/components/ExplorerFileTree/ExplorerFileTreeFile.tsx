import type { FileTreeFile, FileTreeFileStatus } from "+explorer/state/FileTree"
import type { FilePath } from "+types/FilePath"
import type { Renderable } from "+types/Renderable"

export function ExplorerFileTreeFile(props: {
	file: FileTreeFile
	onFileSelected: (filePath: FilePath) => void
}): Renderable {
	const filename = props.file.path.slice(props.file.path.lastIndexOf("/") + 1)
	const status = props.file.status

	return (
		<div class="ml-5 w-full">
			<button
				type="button"
				class={`w-full flex gap-x-4 items-center cursor-pointer transition ${getStatusColourClass(status)} hover:translate-x-1`}
				onClick={(): void => {
					props.onFileSelected(props.file.path)
				}}
			>
				<span class="">{filename}</span>
				<span class="text-xs">{status}</span>
			</button>
		</div>
	)
}

function getStatusColourClass(status: FileTreeFileStatus): string {
	switch (status) {
		case "failed": {
			return "text-red-500 hover:text-red-400"
		}
		case "passed": {
			return "text-green-500 hover:text-green-400"
		}
		case "registered":
		case "skipped": {
			return "text-gray-500 hover:text-gray-400"
		}
		case "started": {
			return "text-yellow-500 hover:text-yellow-400"
		}
	}
}
