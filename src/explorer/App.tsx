import type { Renderable } from "+types/Renderable"

export function App(): Renderable {
	return (
		<>
			<div class="text-2xl font-bold">Vitest &ndash; Vitus</div>
			<noscript>You need to enable JavaScript to run this app.</noscript>
		</>
	)
}
