import { ExplorerApp } from "+explorer/ExplorerApp"
import type { ExplorerState } from "+explorer/state/ExplorerState"
import { describe, expect, it } from "vitest"

describe("ExplorerApp", () => {
	it("should be defined", async () => {
		const initialState: ExplorerState = { status: "started", fileTree: [] }
		expect(
			<ExplorerApp initialState={initialState} initialTheme={null} />,
		).toBeDefined()
	})
})
