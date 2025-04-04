export type ServerDisconnectedDto = {
	type: "server-disconnected"
}

export function serverDisconnected(): ServerDisconnectedDto {
	return { type: "server-disconnected" }
}
