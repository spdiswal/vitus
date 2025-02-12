import { readFile } from "node:fs/promises"
import type { EventStream } from "+server/EventStream"
import type { Event } from "+server/events/Event"
import type { Middleware as PolkaMiddleware } from "polka"

type RequestHandler = (request: Request, response: Response) => Promise<void>
type Request = Parameters<PolkaMiddleware>[0]
type Response = Parameters<PolkaMiddleware>[1]

export async function loadIndexHtml(path: string): Promise<string> {
	const indexHtml = await readFile(path, "utf-8")
	return indexHtml.slice(0, -"</body></html>".length)
}

export function handleEventStreamRequests(
	eventStream: EventStream,
): RequestHandler {
	return async (request, response): Promise<void> => {
		response.writeHead(200, {
			"content-type": "text/event-stream",
			"cache-control": "no-cache",
			connection: "keep-alive",
		})

		function handleEvent(event: Event): void {
			// Messages in the event stream format must be terminated by a pair of newline characters.
			// https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
			response.write(`data: ${JSON.stringify(event)}\n\n`)
		}

		function handleHeartbeat(): void {
			// A neutral comment message to keep the client-server connection alive.
			response.write(": ping\n\n")
		}

		const heartbeatIntervalMs = 15_000
		const heartbeatTimer = setInterval(handleHeartbeat, heartbeatIntervalMs)
		eventStream.subscribe(handleEvent)

		request.on("close", () => {
			clearInterval(heartbeatTimer)
			eventStream.unsubscribe(handleEvent)
			response.end()
		})
	}
}

export function handleIndexHtmlRequests(
	base: string,
	indexHtml: string,
	renderHtml: (requestUrl: string) => Promise<string>,
	onError?: (error: Error) => void,
): RequestHandler {
	return async (request, response): Promise<void> => {
		const requestUrl = request.originalUrl.replace(base, "")

		try {
			const bodyHtml = await renderHtml(requestUrl)
			const html = `${indexHtml}${bodyHtml}</body></html>`

			response.writeHead(200, { "content-type": "text/html" }).end(html)
		} catch (error) {
			if (error instanceof Error) {
				onError?.(error)
				response.writeHead(500).end(error.stack)
			} else {
				response.writeHead(500).end("Unknown error")
			}
		}
	}
}
