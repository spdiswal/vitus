#!/usr/bin/env node
import { renderBodyHtml, renderInitialProject } from "+explorer/ExplorerServer"
import { newEventStream } from "+server/EventStream"
import { newEventStreamReporter } from "+server/EventStreamReporter"
import {
	handleEventStreamRequests,
	handleIndexHtmlRequests,
	loadIndexHtmlParts,
} from "+server/RequestHandlers"
import { newProjectFromVitest } from "+server/models/VitestProject"
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
			const initialProject = newProjectFromVitest(vitest)

			return Promise.all([
				renderInitialProject(initialProject),
				renderBodyHtml(initialProject, requestUrl),
			])
		}),
	)
	.listen(port, (): void => {
		console.log(`Vitus is running at http://localhost:${port}`)
	})
