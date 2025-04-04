import { readFile } from "node:fs/promises"
import type { EventDto } from "+api/events/EventDto"
import type { EventStream } from "+server/EventStream"
import type { Vector } from "+types/Vector"
import type { Middleware as PolkaMiddleware } from "polka"

type RequestHandler = (request: Request, response: Response) => Promise<void>
type Request = Parameters<PolkaMiddleware>[0]
type Response = Parameters<PolkaMiddleware>[1]

const indexHtmlPartitioner = /<!--head-->|<!--body-->/

export async function loadIndexHtmlParts(
	path: string,
): Promise<Vector<string, 3>> {
	const indexHtml = await readFile(path, "utf-8")
	return indexHtml.split(indexHtmlPartitioner) as Vector<string, 3>
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

		function handleEvent(event: EventDto): void {
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
	indexHtmlParts: Vector<string, 3>,
	renderHtmlOutlets: (requestUrl: string) => Promise<Vector<string, 2>>,
	onError?: (error: Error) => void,
): RequestHandler {
	return async (request, response): Promise<void> => {
		const requestUrl = request.originalUrl

		try {
			const [headHtml, bodyHtml] = await renderHtmlOutlets(requestUrl)
			const html = `${indexHtmlParts[0]}${headHtml}${indexHtmlParts[1]}${bodyHtml}${indexHtmlParts[2]}`

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
