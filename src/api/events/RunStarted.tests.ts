import { applyEvent } from "+api/events/Event"
import { runStarted } from "+api/events/RunStarted"
import { getModulesByIds } from "+api/models/Module"
import type { Project } from "+api/models/Project"
import { dummyProject } from "+api/models/Project.fixtures"
import { getSubtasksByModuleIds } from "+api/models/Subtask"
import type { TaskId } from "+api/models/TaskId"
import type { TaskStatus } from "+api/models/TaskStatus"
import type { Vector } from "+types/Vector"
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
		moduleIds: Vector<TaskId, 2>
	}) => {
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(initialProject, runStarted(props.moduleIds))
		})

		it("sets the module statuses to 'started'", () => {
			const actualModuleStatuses = Array.from(
				new Set(
					getModulesByIds(actualProject, props.moduleIds).map(
						(module) => module.status,
					),
				),
			)

			expect(actualModuleStatuses).toHaveLength(1)
			expect(actualModuleStatuses[0]).toEqual<TaskStatus>("started")
		})

		it("sets the module subtask statuses to 'started'", () => {
			const actualSubtaskStatuses = Array.from(
				new Set(
					getSubtasksByModuleIds(actualProject, props.moduleIds).map(
						(subtask) => subtask.status,
					),
				),
			)

			expect(actualSubtaskStatuses).toHaveLength(1)
			expect(actualSubtaskStatuses[0]).toEqual<TaskStatus>("started")
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
