import { applyProjectEvent } from "+events/ProjectEvent"
import { modulePassedEvent } from "+events/module/ModulePassedEvent"
import type { Module, ModuleId, ModuleStatus } from "+models/Module"
import { dummyModule } from "+models/Module.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertDummyProject,
	getModuleById,
	getOtherModules,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyModule("15b021ef72", { duration: 1, status: "failed" }),
	dummyModule("a3fdd8b6c3", { duration: 3, status: "skipped" }),
	dummyModule("-1730f876b4", { duration: 5, status: "skipped" }),
	dummyModule("-e45b128829", { duration: 7, status: "skipped" }),
])

beforeAll(() => {
	assertDummyProject(initialProject, { duration: 16, status: "failed" })
})

describe.each`
	id               | duration | expectedProjectDuration | expectedProjectStatus
	${"15b021ef72"}  | ${4}     | ${4 + 3 + 5 + 7}        | ${"passed"}
	${"a3fdd8b6c3"}  | ${8}     | ${1 + 8 + 5 + 7}        | ${"failed"}
	${"-1730f876b4"} | ${1}     | ${1 + 3 + 1 + 7}        | ${"failed"}
	${"-e45b128829"} | ${5}     | ${1 + 3 + 5 + 5}        | ${"failed"}
`(
	"when an existing module with id $id has passed",
	(props: {
		id: ModuleId
		duration: Duration
		expectedProjectDuration: Duration
		expectedProjectStatus: ProjectStatus
	}) => {
		let actualProject: Project
		let actualModule: Module

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				modulePassedEvent({ id: props.id, duration: props.duration }),
			)

			const module = getModuleById(actualProject, props.id)
			assertNotNullish(module)
			actualModule = module
		})

		it("sets the module status to 'passed'", () => {
			expect(actualModule.status).toBe<ModuleStatus>("passed")
		})

		it("updates the module duration", () => {
			expect(actualModule.duration).toBe(props.duration)
		})

		it("does not affect the number of modules in the project", () => {
			expect(actualProject.modules).toHaveLength(initialProject.modules.length)
		})

		it("does not affect the other modules in the project", () => {
			expect(getOtherModules(actualProject, props.id)).toEqual(
				getOtherModules(initialProject, props.id),
			)
		})

		it("updates the project duration based on the latest set of modules", () => {
			expect(actualProject.duration).toBe(props.expectedProjectDuration)
		})

		it("updates the project status based on the latest set of modules", () => {
			expect(actualProject.status).toBe(props.expectedProjectStatus)
		})
	},
)

describe("when a non-existing module has passed", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyProjectEvent(
			initialProject,
			modulePassedEvent({ id: "f9bb9e8bc0", duration: 8 }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
