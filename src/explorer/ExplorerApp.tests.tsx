import { ExplorerApp } from "+explorer/ExplorerApp"
import { dummyProject } from "+models/Project.fixtures"
import { describe, expect, it } from "vitest"

const project = dummyProject()

describe("ExplorerApp", () => {
	it("should be defined", async () => {
		expect(
			<ExplorerApp initialProject={project} initialTheme={null} />,
		).toBeDefined()
	})
})
