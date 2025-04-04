export type RunCompletedDto = {
	type: "run-completed"
}

export function runCompleted(): RunCompletedDto {
	return { type: "run-completed" }
}
