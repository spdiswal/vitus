import { ExplorerStatusLine } from "+explorer/ExplorerStatusLine"
import { NavigationTree } from "+explorer/navigation/components/NavigationTree"
import { Breadcrumbs } from "+explorer/report/Breadcrumbs"
import { Report } from "+explorer/report/Report"
import type { ExplorerState } from "+explorer/state/ExplorerState"
import { useExplorerState } from "+explorer/state/UseExplorerState"
import { ThemePicker } from "+explorer/theme/ThemePicker"
import { type SelectableTheme, ThemeProvider } from "+explorer/theme/UseTheme"
import type { Renderable } from "+types/Renderable"

export function ExplorerApp(props: {
	initialState: ExplorerState
	initialTheme: SelectableTheme
}): Renderable {
	const state = useExplorerState(props.initialState)

	return (
		<ThemeProvider initialTheme={props.initialTheme}>
			<div class="relative min-h-screen grid grid-cols-[38.2%_1fr]">
				<ExplorerStatusLine
					class="absolute z-10 top-0 inset-x-0"
					status={state.overallStatus}
				/>
				<ThemePicker class="absolute z-10 top-7 right-5" />
				<NavigationTree
					class="pt-10 pb-5 pr-10 h-screen"
					entries={state.navigationEntries}
				/>
				<div class="ml-10 pt-5 flex flex-col">
					<Breadcrumbs />
					<Report />
				</div>
			</div>
		</ThemeProvider>
	)
}
