import { ExplorerFileTree } from "+explorer/components/ExplorerFileTree/ExplorerFileTree"
import type { ExplorerState } from "+explorer/state/ExplorerState"
import { useExplorerState } from "+explorer/state/UseExplorerState"
import type { Renderable } from "+types/Renderable"

export function ExplorerApp(): Renderable {
	const state: ExplorerState = useExplorerState()

	return (
		<div>
			<div class="text-2xl font-bold">Vitest &ndash; Vitus</div>
			<div class="mt-2 font-bold">{state.status}</div>
			<ExplorerFileTree
				class="p-4 w-full"
				tree={state.fileTree}
				onFileSelected={(filePath): void => {
					// biome-ignore lint/suspicious/noConsole: Temporary solution to observe route changes.
					console.debug("File selected:", filePath)
				}}
			/>
		</div>
	)
}
