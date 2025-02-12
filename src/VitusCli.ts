#!/usr/bin/env node

import { renderBodyHtml } from "+explorer/ExplorerServer"
import { getInitialState } from "+explorer/state/ExplorerState"
import { createEventStream } from "+server/EventStream"
import { createEventStreamReporter } from "+server/EventStreamReporter"
import {
	handleEventStreamRequests,
	handleIndexHtmlRequests,
	loadIndexHtml,
} from "+server/RequestHandlers"
import polka from "polka"
import sirv from "sirv"
import { startVitest } from "vitest/node"

const port = 17280
const base = "/"

const deferredIndexHtml = loadIndexHtml("./dist/explorer/index.html")

const eventStream = createEventStream()
const deferredVitest = startVitest("test", [], {
	reporters: [createEventStreamReporter(eventStream)],
})

const [indexHtml, vitest] = await Promise.all([
	deferredIndexHtml,
	deferredVitest,
])

polka()
	.use(base, sirv("./dist/explorer/", { extensions: [] }))
	.get("/api/events", handleEventStreamRequests(eventStream))
	.get(
		"*",
		handleIndexHtmlRequests(base, indexHtml, (requestUrl) =>
			renderBodyHtml(getInitialState(vitest), requestUrl),
		),
	)
	.listen(port, (): void => {
		console.log(`Vitus is running at http://localhost:${port}`)
	})
