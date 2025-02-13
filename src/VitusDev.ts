import { renderInitialState } from "+explorer/ExplorerServer"
import { getInitialState } from "+explorer/state/ExplorerState"
import { createEventStream } from "+server/EventStream"
import { createEventStreamReporter } from "+server/EventStreamReporter"
import {
	handleEventStreamRequests,
	handleIndexHtmlRequests,
	loadIndexHtmlParts,
} from "+server/RequestHandlers"
import polka from "polka"
import { createServer } from "vite"
import { startVitest } from "vitest/node"

const port = 8000
const base = "/"

const deferredIndexHtmlParts = loadIndexHtmlParts("./src/index.html")

const eventStream = createEventStream()
const deferredVitest = startVitest("test", [], {
	reporters: [createEventStreamReporter(eventStream)],
})

const deferredVite = createServer({
	appType: "custom",
	base,
	server: { middlewareMode: true },
})

const [indexHtmlParts, vitest, vite] = await Promise.all([
	deferredIndexHtmlParts,
	deferredVitest,
	deferredVite,
])

polka()
	.use(vite.middlewares)
	.get("/api/events", handleEventStreamRequests(eventStream))
	.get(
		"*",
		handleIndexHtmlRequests(
			base,
			indexHtmlParts,
			async () => [
				renderInitialState(getInitialState(vitest)),
				"", // Render the Preact app fully client-side to prevent hydration errors that cause hot module replacement (HMR) to malfunction.
			],
			vite.ssrFixStacktrace,
		),
	)
	.listen(port, (): void => {
		console.log(`Vitus (dev) is running at http://localhost:${port}`)
	})
