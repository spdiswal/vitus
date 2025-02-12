import { ExplorerStatusLine } from "+explorer/ExplorerStatusLine"
import { Navigation } from "+explorer/navigation/Navigation"
import { Breadcrumbs } from "+explorer/report/Breadcrumbs"
import { Report } from "+explorer/report/Report"
import type { ExplorerState } from "+explorer/state/ExplorerState"
import { ThemePicker } from "+explorer/theme/ThemePicker"
import { type SelectableTheme, ThemeProvider } from "+explorer/theme/UseTheme"
import type { Renderable } from "+types/Renderable"

export function ExplorerApp(props: {
	initialState: ExplorerState
	initialTheme: SelectableTheme
}): Renderable {
	return (
		<ThemeProvider initialTheme={props.initialTheme}>
			<div class="relative min-h-screen grid grid-cols-[38.2%_1fr]">
				<ExplorerStatusLine class="absolute z-10 top-0 inset-x-0" />
				<ThemePicker class="absolute z-10 top-5 right-5" />
				<Navigation />
				<div class="ml-10 flex flex-col">
					<Breadcrumbs />
					<Report />
				</div>
			</div>
		</ThemeProvider>
	)
}
