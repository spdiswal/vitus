import { ExplorerStatusLine } from "+explorer/ExplorerStatusLine"
import { ProjectProvider } from "+explorer/UseProject"
import { NavigationTree } from "+explorer/navigation/NavigationTree"
import { SummaryPage } from "+explorer/routes/summary/SummaryPage"
import type { SelectableTheme } from "+explorer/theme/Theme"
import { ThemePicker } from "+explorer/theme/ThemePicker"
import type { Project } from "+models/Project"
import type { Renderable } from "+types/Renderable"
import { Route, Switch } from "wouter-preact"

export function ExplorerApp(props: {
	initialProject: Project
	initialTheme: SelectableTheme
}): Renderable {
	return (
		<ProjectProvider initialProject={props.initialProject}>
			<div class="relative min-h-screen grid grid-cols-[38.2%_1fr]">
				<ExplorerStatusLine class="absolute z-10 top-0 inset-x-0" />
				<ThemePicker
					class="absolute z-10 top-7 right-5"
					initialTheme={props.initialTheme}
				/>
				<NavigationTree class="pt-10 pb-5 pr-10 h-screen" />
				<div class="ml-10 pt-10 pb-5">
					<Switch>
						<Route path="/" component={SummaryPage} />
					</Switch>
				</div>
			</div>
		</ProjectProvider>
	)
}
