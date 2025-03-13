import { newEventStream } from "+events/EventStream"
import { renderInitialProject } from "+explorer/ExplorerServer"
import { mapVitestToProject } from "+models/Project"
import { newEventStreamReporter } from "+server/EventStreamReporter"
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

const eventStream = newEventStream()
const deferredVitest = startVitest("test", [], {
	reporters: [newEventStreamReporter(eventStream)],
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
				renderInitialProject(mapVitestToProject(vitest)),
				"", // Render the Preact app fully client-side to prevent hydration errors that cause hot module replacement (HMR) to malfunction.
			],
			vite.ssrFixStacktrace,
		),
	)
	.listen(port, (): void => {
		console.log(`Vitus (dev) is running at http://localhost:${port}`)
	})
