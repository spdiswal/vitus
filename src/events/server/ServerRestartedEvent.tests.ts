import { applyProjectEvent } from "+events/ProjectEvent"
import { serverRestartedEvent } from "+events/server/ServerRestartedEvent"
import { dummyModule } from "+models/Module.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertDummyProject,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyModule("15b021ef72", { status: "failed" }),
	dummyModule("a3fdd8b6c3", { status: "passed" }),
	dummyModule("-1730f876b4", { status: "passed" }),
	dummyModule("-e45b128829", { status: "failed" }),
])

beforeAll(() => {
	assertDummyProject(initialProject, { status: "failed" })
})

describe("when the server has restarted", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyProjectEvent(initialProject, serverRestartedEvent())
	})

	it("is still connected", () => {
		expect(actualProject.isConnected).toBe(true)
	})

	it("does not affect the project root path", () => {
		expect(actualProject.rootPath).toBe(initialProject.rootPath)
	})

	it("clears all modules", () => {
		expect(actualProject.modules).toHaveLength(0)
	})

	it("updates the project status based on the latest set of modules", () => {
		expect(actualProject.status).toBe<ProjectStatus>("passed")
	})
})
