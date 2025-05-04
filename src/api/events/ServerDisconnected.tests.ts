import { applyEvent } from "+api/events/Event"
import { serverDisconnected } from "+api/events/ServerDisconnected"
import { getModuleStatuses, getModules } from "+api/models/Module"
import type { DummyModuleId } from "+api/models/Module.fixtures"
import { byModuleIds } from "+api/models/ModuleId"
import type { Project } from "+api/models/Project"
import { dummyProject } from "+api/models/Project.fixtures"
import { getSubtaskStatuses, getSubtasks } from "+api/models/Subtask"
import { bySubtaskIds } from "+api/models/SubtaskId"
import type { DummySuiteId } from "+api/models/Suite.fixtures"
import type { TaskStatus } from "+api/models/TaskStatus"
import type { DummyTestId } from "+api/models/Test.fixtures"
import { not } from "+utilities/Predicates"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject()

const unfinishedModuleIds: Array<DummyModuleId> = ["15b021ef72", "-e45b128829"]
const unfinishedSubtaskIds: Array<DummySuiteId | DummyTestId> = [
	"15b021ef72_1",
	"15b021ef72_2_6",
	"15b021ef72_2_6_9",
	"3afdd8b6c3_0",
	"3afdd8b6c3_0_1",
	"3afdd8b6c3_1",
	"3afdd8b6c3_2_6_7",
	"3afdd8b6c3_2_8",
	"3afdd8b6c3_2_8_1",
	"3afdd8b6c3_2_8_4_1",
	"3afdd8b6c3_4_5",
	"-1730f876b4_0_1",
	"-1730f876b4_0_4",
	"-1730f876b4_0_4_5",
	"-1730f876b4_9",
	"-e45b128829_2_1",
	"-e45b128829_4_4",
]

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

	it("sets the status of unfinished modules to 'skipped'", () => {
		const actualModuleStatuses = getModuleStatuses(
			actualProject,
			byModuleIds(unfinishedModuleIds),
		)
		expect(actualModuleStatuses[0]).toBe<TaskStatus>("skipped")
	})

	it("does not affect the other modules in the project", () => {
		const initialOtherModules = getModules(
			initialProject,
			not(byModuleIds(unfinishedModuleIds)),
		)
		const actualOtherModules = getModules(
			actualProject,
			not(byModuleIds(unfinishedModuleIds)),
		)

		expect(actualOtherModules).toEqual(initialOtherModules)
	})

	it("sets the status of unfinished subtasks to 'skipped'", () => {
		const actualSubtaskStatuses = getSubtaskStatuses(
			actualProject,
			bySubtaskIds(unfinishedSubtaskIds),
		)
		expect(actualSubtaskStatuses[0]).toBe<TaskStatus>("skipped")
	})

	it("does not affect the other subtasks in the project", () => {
		const initialOtherSubtasks = getSubtasks(
			initialProject,
			not(bySubtaskIds(unfinishedSubtaskIds)),
		)
		const actualOtherSubtasks = getSubtasks(
			actualProject,
			not(bySubtaskIds(unfinishedSubtaskIds)),
		)

		expect(actualOtherSubtasks).toEqual(initialOtherSubtasks)
	})

	it("sets the project status to 'skipped'", () => {
		expect(actualProject.status).toBe<TaskStatus>("skipped")
	})
})
