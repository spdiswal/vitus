import { applyProjectEvent } from "+events/ProjectEvent"
import { moduleFailedEvent } from "+events/module/ModuleFailedEvent"
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
	dummyModule("15b021ef72", { duration: 1, status: "passed" }),
	dummyModule("a3fdd8b6c3", { duration: 3, status: "running" }),
	dummyModule("-1730f876b4", { duration: 5, status: "passed" }),
	dummyModule("-e45b128829", { duration: 7, status: "passed" }),
])

beforeAll(() => {
	assertDummyProject(initialProject, { duration: 16, status: "running" })
})

describe.each`
	id               | duration | expectedProjectDuration | expectedProjectStatus
	${"15b021ef72"}  | ${2}     | ${2 + 3 + 5 + 7}        | ${"running"}
	${"a3fdd8b6c3"}  | ${6}     | ${1 + 6 + 5 + 7}        | ${"failed"}
	${"-1730f876b4"} | ${11}    | ${1 + 3 + 11 + 7}       | ${"running"}
	${"-e45b128829"} | ${3}     | ${1 + 3 + 5 + 3}        | ${"running"}
`(
	"when an existing module with id $id has failed",
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
				moduleFailedEvent({ id: props.id, duration: props.duration }),
			)

			const module = getModuleById(actualProject, props.id)
			assertNotNullish(module)
			actualModule = module
		})

		it("sets the module status to 'failed'", () => {
			expect(actualModule.status).toBe<ModuleStatus>("failed")
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

describe("when a non-existing module has failed", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyProjectEvent(
			initialProject,
			moduleFailedEvent({ id: "f9bb9e8bc0", duration: 8 }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
