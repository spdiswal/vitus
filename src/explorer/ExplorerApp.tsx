import { ExplorerFileTree } from "+explorer/components/ExplorerFileTree/ExplorerFileTree"
import type { ExplorerState } from "+explorer/state/ExplorerState"
import { useExplorerState } from "+explorer/state/UseExplorerState"
import { ThemePicker } from "+explorer/theme/ThemePicker"
import { type SelectableTheme, ThemeProvider } from "+explorer/theme/UseTheme"
import type { Renderable } from "+types/Renderable"

export function ExplorerApp(props: {
	initialState: ExplorerState
	initialTheme: SelectableTheme
}): Renderable {
	const state: ExplorerState = useExplorerState(props.initialState)

	return (
		<ThemeProvider initialTheme={props.initialTheme}>
			<div class="text-2xl font-bold">Vitest &ndash; Vitus</div>
			<ThemePicker class="absolute right-5 top-5" />
			<div class="mt-2 font-bold">{state.status}</div>
			<ExplorerFileTree
				class="p-4 w-full"
				tree={state.fileTree}
				onFileSelected={(filePath): void => {
					// biome-ignore lint/suspicious/noConsole: Temporary solution to observe route changes.
					console.debug("File selected:", filePath)
				}}
			/>
		</ThemeProvider>
	)
}
