import { useExplorerState } from "+explorer/ExplorerState"
import type { Renderable } from "+types/Renderable"

export function ExplorerApp(): Renderable {
	const state = useExplorerState()

	return (
		<>
			<div class="text-2xl font-bold">Vitest &ndash; Vitus</div>
			<div class="font-bold">{state.value.status}</div>
			<noscript>You need to enable JavaScript to run this app.</noscript>
		</>
	)
}
