import type { ReadonlySignal, Signal } from "@preact/signals"

export type Computed<Value> = ReadonlySignal<Value>
export type Reactive<Value> = Signal<Value>
