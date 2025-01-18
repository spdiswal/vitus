import { ExplorerApp } from "+explorer/ExplorerApp"
import { describe, expect, it } from "vitest"

describe("ExplorerApp", () => {
	it("should be defined", () => {
		expect(<ExplorerApp />).toBeDefined()
	})
})
