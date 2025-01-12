import { readFile } from "node:fs/promises"
import { renderBodyHtml } from "+explorer/ExplorerServer"
import polka from "polka"
import { createServer } from "vite"

const port = 8000
const base = "/"

const indexHtmlPath = "./src/index.html"
const indexHtmlTrailer = "</body></html>"

const vite = await createServer({
	appType: "custom",
	base,
	server: { middlewareMode: true },
})

async function loadTemplateHtml(requestUrl: string): Promise<string> {
	const template = await readFile(indexHtmlPath, "utf-8") // Loads the most recent version of `index.html`.
	return vite.transformIndexHtml(requestUrl, template)
}

polka()
	.use(vite.middlewares)
	.get("*", async (request, response) => {
		const requestUrl = request.originalUrl.replace(base, "")

		try {
			const [templateHtml, bodyHtml] = await Promise.all([
				loadTemplateHtml(requestUrl),
				renderBodyHtml(requestUrl),
			])
			const html = `${templateHtml.slice(0, -indexHtmlTrailer.length)}${bodyHtml}${indexHtmlTrailer}`

			response.writeHead(200, { "Content-Type": "text/html" }).end(html)
		} catch (error) {
			if (error instanceof Error) {
				vite.ssrFixStacktrace(error)
				response.writeHead(500).end(error.stack)
			} else {
				response.writeHead(500).end("Unknown error")
			}
		}
	})
	.listen(port, () => {
		console.log(`Vitus (dev) is running at http://localhost:${port}`)
	})
