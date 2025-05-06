import { applyEvent } from "+api/events/Event"
import { runStarted } from "+api/events/RunStarted"
import { getModules } from "+api/models/Module"
import type { DummyModuleId } from "+api/models/Module.fixtures"
import { byModuleIds, byParentModuleIds } from "+api/models/ModuleId"
import type { Project } from "+api/models/Project"
import { dummyProject } from "+api/models/Project.fixtures"
import type { ProjectStatus } from "+api/models/ProjectStatus"
import { getSubtasks } from "+api/models/Subtask"
import type { TaskStatusType } from "+api/models/TaskStatus"
import { not } from "+utilities/Predicates"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject()

describe.each`
	moduleIds
	${["15b021ef72", "-1730f876b4"]}
	${["3afdd8b6c3", "-1730f876b4", "-e45b128829"]}
`(
	"when a run has started for modules with ids $moduleIds",
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

		it("sets the status of invalidated modules to 'started'", () => {
			const actualModules = getModules(
				actualProject,
				byModuleIds(invalidatedModuleIds),
			)
			const statusTypes = Array.from(
				new Set(actualModules.map((module) => module.status.type)),
			)

			expect(statusTypes[0]).toBe<TaskStatusType>("started")
		})

		it("does not affect the other modules in the project", () => {
			const initialOtherModules = getModules(
				initialProject,
				not(byModuleIds(invalidatedModuleIds)),
			)
			const actualOtherModules = getModules(
				actualProject,
				not(byModuleIds(invalidatedModuleIds)),
			)

			expect(actualOtherModules).toEqual(initialOtherModules)
		})

		it("sets the status of invalidated subtasks to 'started'", () => {
			const actualSubtasks = getSubtasks(
				actualProject,
				byParentModuleIds(invalidatedModuleIds),
			)
			const statusTypes = Array.from(
				new Set(actualSubtasks.map((subtask) => subtask.status.type)),
			)

			expect(statusTypes[0]).toBe<TaskStatusType>("started")
		})

		it("does not affect the other subtasks in the project", () => {
			const initialOtherSubtasks = getSubtasks(
				initialProject,
				not(byParentModuleIds(invalidatedModuleIds)),
			)
			const actualOtherSubtasks = getSubtasks(
				actualProject,
				not(byParentModuleIds(invalidatedModuleIds)),
			)

			expect(actualOtherSubtasks).toEqual(initialOtherSubtasks)
		})

		it("sets the project status to 'started'", () => {
			expect(actualProject.status).toBe<ProjectStatus>("started")
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
