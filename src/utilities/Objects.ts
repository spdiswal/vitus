export type KeysOfType<Object extends object, Type> = {
	[Key in keyof Object]: Object[Key] extends Type ? Key : never
}[keyof Object]
