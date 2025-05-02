import { applyEvent } from "+api/events/Event"
import { serverDisconnected } from "+api/events/ServerDisconnected"
import type { DummyModuleId } from "+api/models/Module.fixtures"
import type { Project } from "+api/models/Project"
import { dummyProject } from "+api/models/Project.fixtures"
import type { DummySuiteId } from "+api/models/Suite.fixtures"
import type { TaskStatus } from "+api/models/TaskStatus"
import type { DummyTestId } from "+api/models/Test.fixtures"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject()

describe("when the server has disconnected", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(initialProject, serverDisconnected())
	})

	it("is no longer connected", () => {
		expect(actualProject.isConnected).toBe(false)
	})

	it("does not affect the project root path", () => {
		expect(actualProject.rootPath).toBe(initialProject.rootPath)
	})

	it("discards unfinished modules", () => {
		const actualModuleIds = Object.keys(actualProject.modulesById)

		expect(actualModuleIds).toEqual<Array<DummyModuleId>>([
			"3afdd8b6c3",
			"-1730f876b4",
		])
	})

	it("discards unfinished subtasks", () => {
		const actualSubtaskIds = Object.keys(actualProject.subtasksById)

		expect(actualSubtaskIds).toEqual<Array<DummySuiteId | DummyTestId>>([
			"3afdd8b6c3_2",
			"3afdd8b6c3_2_5",
			"3afdd8b6c3_2_6",
			"3afdd8b6c3_2_6_9",
			"3afdd8b6c3_3",
			"3afdd8b6c3_4",
			"-1730f876b4_0",
			"-1730f876b4_0_3",
			"-1730f876b4_7",
		])
	})

	it("updates the project status based on the latest set of modules", () => {
		expect(actualProject.status).toBe<TaskStatus>("failed")
	})
})
