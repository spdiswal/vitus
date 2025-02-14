import { ExplorerApp } from "+explorer/ExplorerApp"
import type { ExplorerState } from "+explorer/state/ExplorerState"
import { describe, expect, it } from "vitest"

describe("ExplorerApp", () => {
	it("should be defined", async () => {
		const initialState: ExplorerState = {
			overallStatus: "commenced",
			navigationEntries: [],
		}
		expect(
			<ExplorerApp initialState={initialState} initialTheme={null} />,
		).toBeDefined()
	})
})
