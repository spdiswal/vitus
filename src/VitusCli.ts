#!/usr/bin/env node

import { createEventStream } from "+server/EventStream"
import { createEventStreamReporter } from "+server/EventStreamReporter"
import { loadIndexHtml } from "+server/LoadIndexHtml"
import {
	handleEventStreamRequests,
	handleIndexHtmlRequests,
} from "+server/RequestHandlers"
import polka from "polka"
import sirv from "sirv"
import { startVitest } from "vitest/node"

const port = 17280
const base = "/"

const cachedIndexHtml = loadIndexHtml("./dist/explorer/index.html")

const eventStream = createEventStream()
await startVitest("test", [], {
	reporters: [createEventStreamReporter(eventStream)],
})

polka()
	.use(base, sirv("./dist/explorer/", { extensions: [] }))
	.get("/api/events", handleEventStreamRequests(eventStream))
	.get("*", handleIndexHtmlRequests(base, cachedIndexHtml))
	.listen(port, (): void => {
		console.log(`Vitus is running at http://localhost:${port}`)
	})
