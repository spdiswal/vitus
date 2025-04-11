import { ExplorerStatusLine } from "+explorer/ExplorerStatusLine"
import { useBatchedEventStream } from "+explorer/UseBatchedEventStream"
import { handleEvent } from "+explorer/events/HandleEvent"
import { logEvent } from "+explorer/events/LogEvent"
import { NavigationTree } from "+explorer/navigation/NavigationTree"
import { ResultsPage } from "+explorer/routes/results/ResultsPage"
import { SummaryPage } from "+explorer/routes/summary/SummaryPage"
import type { SelectableTheme } from "+explorer/theme/Theme"
import { ThemePicker } from "+explorer/theme/ThemePicker"
import type { Renderable } from "+types/Renderable"
import { Route, Switch } from "wouter-preact"

export function ExplorerApp(props: {
	initialTheme: SelectableTheme
}): Renderable {
	useBatchedEventStream((events) => {
		for (const event of events) {
			handleEvent(event)
			logEvent(event)
		}
	}, 50)

	return (
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
					<Route path="/:taskId" component={ResultsPage} />
				</Switch>
			</div>
		</div>
	)
}
