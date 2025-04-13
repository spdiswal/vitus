import { applyProjectEvent } from "+events/ProjectEvent"
import { runStartedEvent } from "+events/run/RunStartedEvent"
import type { Module, ModuleId, ModuleStatus } from "+models/Module"
import { dummyModule } from "+models/Module.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertDummyProject,
	getModuleById,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Duration } from "+types/Duration"
import type { Vector } from "+types/Vector"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyModule("15b021ef72", { duration: 10, status: "passed" }),
	dummyModule("a3fdd8b6c3", { duration: 20, status: "failed" }),
	dummyModule("-1730f876b4", { duration: 40, status: "passed" }),
	dummyModule("-e45b128829", { duration: 80, status: "passed" }),
])

beforeAll(() => {
	assertDummyProject(initialProject, { duration: 150, status: "failed" })
})

describe.each`
	moduleIds                        | expectedProjectDuration
	${["15b021ef72", "-1730f876b4"]} | ${/**/ 20 + /**/ 80}
	${["a3fdd8b6c3", "-1730f876b4"]} | ${10 + /**/ /**/ 80}
	${["a3fdd8b6c3", "-e45b128829"]} | ${10 + /**/ 40 /**/}
`(
	"when a run has started for 2 modules with ids $moduleIds.0 and $moduleIds.1",
	(props: {
		moduleIds: Vector<ModuleId, 2>
		expectedProjectDuration: Duration
	}) => {
		let actualProject: Project
		let actualModules: Vector<Module, 2>

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				runStartedEvent({ invalidatedModuleIds: props.moduleIds }),
			)

			const moduleA = getModuleById(actualProject, props.moduleIds[0])
			const moduleB = getModuleById(actualProject, props.moduleIds[1])

			assertNotNullish(moduleA)
			assertNotNullish(moduleB)

			actualModules = [moduleA, moduleB]
		})

		it("sets the module statuses to 'running'", () => {
			expect(actualModules[0].status).toBe<ModuleStatus>("running")
			expect(actualModules[1].status).toBe<ModuleStatus>("running")
		})

		it("clears the module durations", () => {
			expect(actualModules[0].duration).toBe(0)
			expect(actualModules[1].duration).toBe(0)
		})

		it("does not affect the number of modules in the project", () => {
			expect(actualProject.modules).toHaveLength(initialProject.modules.length)
		})

		it("updates the project duration based on the latest set of modules", () => {
			expect(actualProject.duration).toBe(props.expectedProjectDuration)
		})

		it("updates the project status based on the latest set of modules", () => {
			expect(actualProject.status).toBe<ProjectStatus>("running")
		})
	},
)

describe("when a run has started for a non-existing module", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyProjectEvent(
			initialProject,
			runStartedEvent({ invalidatedModuleIds: ["f9bb9e8bc0"] }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
