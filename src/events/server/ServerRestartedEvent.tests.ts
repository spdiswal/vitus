import { applyProjectEvent } from "+events/ProjectEvent"
import { serverRestartedEvent } from "+events/server/ServerRestartedEvent"
import type { Project, ProjectStatus } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject()

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
		const actualModuleIds = Object.keys(actualProject.modulesById)
		expect(actualModuleIds).toHaveLength(0)
	})

	it("clears all suites and tests", () => {
		const actualSubtaskIds = Object.keys(actualProject.subtasksById)
		expect(actualSubtaskIds).toHaveLength(0)
	})

	it("updates the project status based on the latest set of modules", () => {
		expect(actualProject.status).toBe<ProjectStatus>("passed")
	})
})
