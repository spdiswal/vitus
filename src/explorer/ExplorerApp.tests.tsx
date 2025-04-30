import { dummyProject } from "+api/models/Project.fixtures"
import { ExplorerApp } from "+explorer/ExplorerApp"
import { describe, expect, it } from "vitest"

const project = dummyProject()

describe("ExplorerApp", () => {
	it("should be defined", async () => {
		expect(
			<ExplorerApp initialProject={project} initialTheme={null} />,
		).toBeDefined()
	})
})
