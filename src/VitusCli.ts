#!/usr/bin/env node

import { newEventStream } from "+events/EventStream"
import { renderBodyHtml, renderInitialProject } from "+explorer/ExplorerServer"
import { mapVitestToProject } from "+models/Project"
import { newEventStreamReporter } from "+server/EventStreamReporter"
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
		handleIndexHtmlRequests(base, indexHtmlParts, (requestUrl) => {
			const initialProject = mapVitestToProject(vitest)

			return Promise.all([
				renderInitialProject(initialProject),
				renderBodyHtml(initialProject, requestUrl),
			])
		}),
	)
	.listen(port, (): void => {
		console.log(`Vitus is running at http://localhost:${port}`)
	})
