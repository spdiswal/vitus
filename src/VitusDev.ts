import { renderInitialProject } from "+explorer/ExplorerServer"
import { newEventStream } from "+server/EventStream"
import { newEventStreamReporter } from "+server/EventStreamReporter"
import {
	handleEventStreamRequests,
	handleIndexHtmlRequests,
	loadIndexHtmlParts,
} from "+server/RequestHandlers"
import { newProjectFromVitest } from "+server/models/VitestProject"
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
			indexHtmlParts,
			async () => [
				renderInitialProject(newProjectFromVitest(vitest)),
				"", // Render the Preact app fully client-side to prevent hydration errors that cause hot module replacement (HMR) to malfunction.
			],
			vite.ssrFixStacktrace,
		),
	)
	.listen(port, (): void => {
		console.log(`Vitus (dev) is running at http://localhost:${port}`)
	})
