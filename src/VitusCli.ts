#!/usr/bin/env node

import { renderBodyHtml, renderInitialState } from "+explorer/ExplorerServer"
import { newEventStream } from "+server/EventStream"
import { newEventStreamReporter } from "+server/EventStreamReporter"
import {
	handleEventStreamRequests,
	handleIndexHtmlRequests,
	loadIndexHtmlParts,
} from "+server/RequestHandlers"
import { vitestStateToDto } from "+server/models/VitestState"
import polka from "polka"
import sirv from "sirv"
import { startVitest } from "vitest/node"

const port = 17280
const base = "/"

const deferredIndexHtmlParts = loadIndexHtmlParts("./dist/explorer/index.html")

const eventStream = newEventStream()
const deferredVitest = startVitest("test", [], {
	reporters: [newEventStreamReporter(eventStream)],
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
		handleIndexHtmlRequests(indexHtmlParts, (requestUrl) => {
			const initialStateDto = vitestStateToDto(vitest)

			return Promise.all([
				renderInitialState(initialStateDto),
				renderBodyHtml(initialStateDto, requestUrl),
			])
		}),
	)
	.listen(port, (): void => {
		console.log(`Vitus is running at http://localhost:${port}`)
	})
