export type ModuleDeletedDto = {
	type: "module-deleted"
	path: string
}

export function moduleDeleted(path: string): ModuleDeletedDto {
	return { type: "module-deleted", path }
}
