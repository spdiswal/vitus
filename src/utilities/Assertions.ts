export function assertContextValue<Value>(
	contextProviderName: string,
	value: Value | undefined,
): asserts value is Value {
	if (value === undefined) {
		throw new Error(
			`${contextProviderName} is missing in the component hierarchy`,
		)
	}
}

export function assertNotNullish<Value>(
	value: Value | null | undefined,
	name?: string,
): asserts value is Value {
	if (value === null || value === undefined) {
		throw new Error(
			`Expected ${name !== undefined ? `${name} to be ` : ""}a not-nullish value, but was ${value}`,
		)
	}
}
