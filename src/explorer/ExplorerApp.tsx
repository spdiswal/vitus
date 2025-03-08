import { ExplorerStatusLine } from "+explorer/ExplorerStatusLine"
import { useProjectState } from "+explorer/UseProjectState"
import { NavigationTree } from "+explorer/navigation/NavigationTree"
import { Breadcrumbs } from "+explorer/report/Breadcrumbs"
import { Report } from "+explorer/report/Report"
import { ThemePicker } from "+explorer/theme/ThemePicker"
import { type SelectableTheme, ThemeProvider } from "+explorer/theme/UseTheme"
import type { Project } from "+models/Project"
import type { Renderable } from "+types/Renderable"

export function ExplorerApp(props: {
	initialProject: Project
	initialTheme: SelectableTheme
}): Renderable {
	const project = useProjectState(props.initialProject)

	return (
		<ThemeProvider initialTheme={props.initialTheme}>
			<div class="relative min-h-screen grid grid-cols-[38.2%_1fr]">
				<ExplorerStatusLine
					class="absolute z-10 top-0 inset-x-0"
					connected={project.isConnected}
					status={project.status}
				/>
				<ThemePicker class="absolute z-10 top-7 right-5" />
				<NavigationTree
					class="pt-10 pb-5 pr-10 h-screen"
					files={project.files}
				/>
				<div class="ml-10 pt-5 flex flex-col">
					<Breadcrumbs />
					<Report />
				</div>
			</div>
		</ThemeProvider>
	)
}
