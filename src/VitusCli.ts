#!/usr/bin/env node

import { renderBodyHtml, renderInitialState } from "+explorer/ExplorerServer"
import { getInitialState } from "+explorer/state/ExplorerState"
import { createEventStream } from "+server/EventStream"
import { createEventStreamReporter } from "+server/EventStreamReporter"
import {
	handleEventStreamRequests,
	handleIndexHtmlRequests,
	loadIndexHtmlParts,
} from "+server/RequestHandlers"
import polka from "polka"
import sirv from "sirv"
import { startVitest } from "vitest/node"

const port = 17280
const base = "/"

const deferredIndexHtmlParts = loadIndexHtmlParts("./dist/explorer/index.html")

const eventStream = createEventStream()
const deferredVitest = startVitest("test", [], {
	reporters: [createEventStreamReporter(eventStream)],
})

const [indexHtmlParts, vitest] = await Promise.all([
	deferredIndexHtmlParts,
	deferredVitest,
])

polka()
	.use(base, sirv("./dist/explorer/", { extensions: [] }))
	.get("/api/events", handleEventStreamRequests(eventStream))
	.get(
		"*",
		handleIndexHtmlRequests(base, indexHtmlParts, (requestUrl) => {
			const initialState = getInitialState(vitest)

			return Promise.all([
				renderInitialState(initialState),
				renderBodyHtml(initialState, requestUrl),
			])
		}),
	)
	.listen(port, (): void => {
		console.log(`Vitus is running at http://localhost:${port}`)
	})
