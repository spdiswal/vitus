import { renderBodyHtml } from "+explorer/ExplorerServer"
import type { EventStream } from "+server/EventStream"
import type { ServerEvent } from "+server/ServerEvent"
import type { Middleware as PolkaMiddleware } from "polka"

type RequestHandler = (request: Request, response: Response) => Promise<void>
type Request = Parameters<PolkaMiddleware>[0]
type Response = Parameters<PolkaMiddleware>[1]

export function handleEventStreamRequests(
	eventStream: EventStream,
): RequestHandler {
	return async (request, response): Promise<void> => {
		response.writeHead(200, {
			"content-type": "text/event-stream",
			"cache-control": "no-cache",
			connection: "keep-alive",
		})

		function pushEvent(event: ServerEvent): void {
			// Messages in the event stream format must be terminated by a pair of newline characters.
			// https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
			response.write(`data: ${event}\n\n`)
		}

		function pushHeartbeat(): void {
			// A neutral comment message to keep the client-server connection alive.
			response.write(": ping\n\n")
		}

		const heartbeatIntervalMs = 15_000
		const heartbeatTimer = setInterval(pushHeartbeat, heartbeatIntervalMs)
		eventStream.on("message", pushEvent)

		request.on("close", () => {
			clearInterval(heartbeatTimer)
			eventStream.removeListener("message", pushEvent)
			response.end()
		})
	}
}

export function handleIndexHtmlRequests(
	base: string,
	getIndexHtmlHeader:
		| Promise<string>
		| ((requestUrl: string) => Promise<string>),
	onError?: (error: Error) => void,
): RequestHandler {
	return async (request, response): Promise<void> => {
		const requestUrl = request.originalUrl.replace(base, "")

		try {
			const [indexHtmlHeader, bodyHtml] = await Promise.all([
				typeof getIndexHtmlHeader === "function"
					? getIndexHtmlHeader(requestUrl)
					: getIndexHtmlHeader,
				renderBodyHtml(requestUrl),
			])
			const html = `${indexHtmlHeader}${bodyHtml}</body></html>`

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
