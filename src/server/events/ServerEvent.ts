export type ServerEvent = {
	scope: "server"
	status: ServerEventStatus
}

export type ServerEventStatus = "disconnected" | "restarted"

export function mapToServerEvent(status: ServerEventStatus): ServerEvent {
	return { scope: "server", status }
}
