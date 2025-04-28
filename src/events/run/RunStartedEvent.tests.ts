import { applyProjectEvent } from "+events/ProjectEvent"
import { runStartedEvent } from "+events/run/RunStartedEvent"
import { type Module, getModuleById } from "+models/Module"
import type { Project, ProjectStatus } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { TaskId } from "+models/TaskId"
import type { TaskStatus } from "+models/TaskStatus"
import type { Vector } from "+types/Vector"
import { assertNotNullish } from "+utilities/Assertions"
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
		let actualModules: Vector<Module, 2>

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				runStartedEvent(props.moduleIds),
			)

			const moduleA = getModuleById(actualProject, props.moduleIds[0])
			const moduleB = getModuleById(actualProject, props.moduleIds[1])

			assertNotNullish(moduleA)
			assertNotNullish(moduleB)

			actualModules = [moduleA, moduleB]
		})

		it("sets the module statuses to 'started'", () => {
			expect(actualModules[0].status).toBe<TaskStatus>("started")
			expect(actualModules[1].status).toBe<TaskStatus>("started")
		})

		it.todo("sets the module subtask statuses to 'started'", () => {
			// expect(actualModules[0].status).toBe<TaskStatus>("started")
			// expect(actualModules[1].status).toBe<TaskStatus>("started")
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
			expect(actualProject.status).toBe<ProjectStatus>("started")
		})
	},
)

describe("when a run has started for a non-existing module", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyProjectEvent(
			initialProject,
			runStartedEvent(["f9bb9e8bc0"]),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
