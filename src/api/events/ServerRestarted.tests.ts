import { applyEvent } from "+api/events/Event"
import { serverRestarted } from "+api/events/ServerRestarted"
import type { Project } from "+api/models/Project"
import { dummyProject } from "+api/models/Project.fixtures"
import type { ProjectStatus } from "+api/models/ProjectStatus"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject()

describe("when the server has restarted", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(initialProject, serverRestarted())
	})

	it("does not affect the project root path", () => {
		expect(actualProject.rootPath).toBe(initialProject.rootPath)
	})

	it("clears all modules", () => {
		const actualModuleIds = Object.keys(actualProject.modulesById)
		expect(actualModuleIds).toHaveLength(0)
	})

	it("clears all subtasks", () => {
		const actualSubtaskIds = Object.keys(actualProject.subtasksById)
		expect(actualSubtaskIds).toHaveLength(0)
	})

	it("sets the project status to 'started'", () => {
		expect(actualProject.status).toBe<ProjectStatus>("started")
	})
})
