import { App } from "+explorer/App"
import { describe, expect, it } from "vitest"

describe("App", () => {
	it("should be defined", () => {
		expect(<App />).toBeDefined()
	})
})
