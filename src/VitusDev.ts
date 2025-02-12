import { createEventStream } from "+server/EventStream"
import { createEventStreamReporter } from "+server/EventStreamReporter"
import {
	handleEventStreamRequests,
	handleIndexHtmlRequests,
	loadIndexHtml,
} from "+server/RequestHandlers"
import polka from "polka"
import { createServer } from "vite"
import { startVitest } from "vitest/node"

const port = 8000
const base = "/"

const deferredIndexHtml = loadIndexHtml("./src/index.html")

const eventStream = createEventStream()
const deferredVitest = startVitest("test", [], {
	reporters: [createEventStreamReporter(eventStream)],
})

const deferredVite = createServer({
	appType: "custom",
	base,
	server: { middlewareMode: true },
})

const [indexHtml, , vite] = await Promise.all([
	deferredIndexHtml,
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
			indexHtml,
			async () => "", // Render everything client-side to prevent hydration errors that cause hot module replacement (HMR) to malfunction in Preact.
			vite.ssrFixStacktrace,
		),
	)
	.listen(port, (): void => {
		console.log(`Vitus (dev) is running at http://localhost:${port}`)
	})
