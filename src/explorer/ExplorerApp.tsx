import { useExplorerState } from "+explorer/ExplorerState"
import type { Renderable } from "+types/Renderable"

export function ExplorerApp(): Renderable {
	const state = useExplorerState()

	return (
		<>
			<div class="text-2xl font-bold">Vitest &ndash; Vitus</div>
			<div class="font-bold">{state.value.runnerStatus}</div>
			<ul>
				{state.value.events.map((event, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: The index key is just a temporary solution until the event contains an id.
					<li key={index}>{JSON.stringify(event)}</li>
				))}
			</ul>
			<noscript>You need to enable JavaScript to run this app.</noscript>
		</>
	)
}
