import { applyEvent } from "+api/events/Event"
import { serverRestarted } from "+api/events/ServerRestarted"
import type { Project } from "+api/models/Project"
import { dummyProject } from "+api/models/Project.fixtures"
import type { TaskStatus } from "+api/models/TaskStatus"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject()

describe("when the server has restarted", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(initialProject, serverRestarted())
	})

	it("is connected", () => {
		expect(actualProject.isConnected).toBe(true)
	})

	it("does not affect the project root path", () => {
		expect(actualProject.rootPath).toBe(initialProject.rootPath)
	})

	it("clears all modules", () => {
		const actualModuleIds = Object.keys(actualProject.modulesById)
		expect(actualModuleIds).toHaveLength(0)
	})

	it("clears all suites and tests", () => {
		const actualSubtaskIds = Object.keys(actualProject.subtasksById)
		expect(actualSubtaskIds).toHaveLength(0)
	})

	it("updates the project status based on the latest set of modules", () => {
		expect(actualProject.status).toBe<TaskStatus>("skipped")
	})
})
