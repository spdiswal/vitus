#!/usr/bin/env node

import { readFile } from "node:fs/promises"
import { renderBodyHtml } from "+explorer/ExplorerServer"
import polka from "polka"
import sirv from "sirv"

const port = 17280
const base = "/"

const staticAssetsPath = "./dist/explorer/"
const indexHtmlPath = "./dist/explorer/index.html"
const indexHtmlTrailer = "</body></html>"

const cachedTemplateHtml = readFile(indexHtmlPath, "utf-8")

polka()
	.use(base, sirv(staticAssetsPath, { extensions: [] }))
	.get("*", async (request, response) => {
		const requestUrl = request.originalUrl.replace(base, "")

		try {
			const [templateHtml, bodyHtml] = await Promise.all([
				cachedTemplateHtml,
				renderBodyHtml(requestUrl),
			])
			const html = `${templateHtml.slice(0, -indexHtmlTrailer.length)}${bodyHtml}${indexHtmlTrailer}`

			response.writeHead(200, { "Content-Type": "text/html" }).end(html)
		} catch (error) {
			if (error instanceof Error) {
				response.writeHead(500).end(error.stack)
			} else {
				response.writeHead(500).end("Unknown error")
			}
		}
	})
	.listen(port, () => {
		console.log(`Vitus is running at http://localhost:${port}`)
	})
