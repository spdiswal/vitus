import { applyProjectEvent } from "+events/ProjectEvent"
import { runCompletedEvent } from "+events/run/RunCompletedEvent"
import type { DummyModuleId } from "+models/Module.fixtures"
import type { Project } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { DummySuiteId } from "+models/Suite.fixtures"
import type { TaskStatus } from "+models/TaskStatus"
import type { DummyTestId } from "+models/Test.fixtures"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject()

describe("when the run has completed", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyProjectEvent(initialProject, runCompletedEvent())
	})

	it("discards unfinished tasks", () => {
		const actualModuleIds = Object.keys(actualProject.modulesById)
		const actualSubtaskIds = Object.keys(actualProject.subtasksById)

		expect(actualModuleIds).toEqual<Array<DummyModuleId>>([
			"3afdd8b6c3",
			"-1730f876b4",
		])
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
