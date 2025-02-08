import { createEventStream } from "+server/EventStream"
import { createEventStreamReporter } from "+server/EventStreamReporter"
import { loadIndexHtml } from "+server/LoadIndexHtml"
import {
	handleEventStreamRequests,
	handleIndexHtmlRequests,
} from "+server/RequestHandlers"
import polka from "polka"
import { createServer } from "vite"
import { startVitest } from "vitest/node"

const port = 8000
const base = "/"

const vite = await createServer({
	appType: "custom",
	base,
	server: { middlewareMode: true },
})

const eventStream = createEventStream()
const vitest = await startVitest("test", [], {
	reporters: [createEventStreamReporter(eventStream)],
})

polka()
	.use(vite.middlewares)
	.get("/api/events", handleEventStreamRequests(eventStream))
	.get(
		"*",
		handleIndexHtmlRequests(
			base,
			vitest,
			(requestUrl) =>
				// Always load the most recent version of `index.html` on every request.
				loadIndexHtml("./src/index.html", (html) =>
					vite.transformIndexHtml(requestUrl, html),
				),
			(error) => vite.ssrFixStacktrace(error),
		),
	)
	.listen(port, (): void => {
		console.log(`Vitus (dev) is running at http://localhost:${port}`)
	})
