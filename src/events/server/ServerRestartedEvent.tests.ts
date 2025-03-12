import { applyProjectEvent } from "+events/ProjectEvent"
import { serverRestartedEvent } from "+events/server/ServerRestartedEvent"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertDummyProject,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyFile("15b021ef72", { duration: 10, status: "failed" }),
	dummyFile("a3fdd8b6c3", { duration: 20, status: "passed" }),
	dummyFile("-1730f876b4", { duration: 40, status: "passed" }),
	dummyFile("-e45b128829", { duration: 80, status: "failed" }),
])

beforeAll(() => {
	assertDummyProject(initialProject, { duration: 150, status: "failed" })
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

	it("clears all files", () => {
		expect(actualProject.files).toHaveLength(0)
	})

	it("updates the project duration based on the latest fileset", () => {
		expect(actualProject.duration).toBe(0)
	})

	it("updates the project status based on the latest fileset", () => {
		expect(actualProject.status).toBe<ProjectStatus>("passed")
	})
})
