export type ServerRestartedDto = {
	type: "server-restarted"
}

export function serverRestarted(): ServerRestartedDto {
	return { type: "server-restarted" }
}
