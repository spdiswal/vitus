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
