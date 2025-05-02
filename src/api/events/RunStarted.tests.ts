import { applyEvent } from "+api/events/Event"
import { runStarted } from "+api/events/RunStarted"
import { getModules } from "+api/models/Module"
import type { DummyModuleId } from "+api/models/Module.fixtures"
import { byModuleIds, byParentModuleIds } from "+api/models/ModuleId"
import type { Project } from "+api/models/Project"
import { dummyProject } from "+api/models/Project.fixtures"
import { getSubtasks } from "+api/models/Subtask"
import type { TaskStatus } from "+api/models/TaskStatus"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject()

describe.each`
	moduleIds
	${["15b021ef72", "-1730f876b4"]}
	${["3afdd8b6c3", "-1730f876b4"]}
	${["3afdd8b6c3", "-e45b128829"]}
`(
	"when a run has started for 2 modules with ids $moduleIds.0 and $moduleIds.1",
	(props: {
		moduleIds: Array<DummyModuleId>
	}) => {
		const invalidatedModuleIds = props.moduleIds
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				runStarted(invalidatedModuleIds),
			)
		})

		it("sets the module statuses to 'started'", () => {
			const actualModuleStatuses = new Set(
				getModules(actualProject, byModuleIds(invalidatedModuleIds)).map(
					(module) => module.status,
				),
			)
			expect(actualModuleStatuses).toEqual(new Set<TaskStatus>(["started"]))
		})

		it("sets the module subtask statuses to 'started'", () => {
			const actualSubtaskStatuses = new Set(
				getSubtasks(actualProject, byParentModuleIds(invalidatedModuleIds)).map(
					(subtask) => subtask.status,
				),
			)
			expect(actualSubtaskStatuses).toEqual(new Set<TaskStatus>(["started"]))
		})

		it("does not affect the set of suites and tests in the project", () => {
			const actualSubtaskIds = Object.keys(actualProject.subtasksById)
			const initialSubtaskIds = Object.keys(initialProject.subtasksById)

			expect(actualSubtaskIds).toEqual(initialSubtaskIds)
		})

		it("does not affect the set of modules in the project", () => {
			const actualModuleIds = Object.keys(actualProject.modulesById)
			const initialModuleIds = Object.keys(initialProject.modulesById)

			expect(actualModuleIds).toHaveLength(initialModuleIds.length)
		})

		it("updates the project status based on the latest set of modules", () => {
			expect(actualProject.status).toBe<TaskStatus>("started")
		})
	},
)

describe("when a run has started for a non-existing module", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(initialProject, runStarted(["f9bb9e8bc0"]))
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
