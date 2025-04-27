import { ExplorerApp } from "+explorer/ExplorerApp"
import { dummyModule } from "+models/Module.fixtures"
import { dummyProject } from "+models/Project.fixtures"
import { describe, expect, it } from "vitest"

const project = dummyProject({}, [
	dummyModule("15b021ef72", { status: "passed" }),
	dummyModule("a3fdd8b6c3", { status: "passed" }),
	dummyModule("-1730f876b4", { status: "running" }),
	dummyModule("-e45b128829", { status: "passed" }),
])

describe("ExplorerApp", () => {
	it("should be defined", async () => {
		expect(
			<ExplorerApp initialProject={project} initialTheme={null} />,
		).toBeDefined()
	})
})
