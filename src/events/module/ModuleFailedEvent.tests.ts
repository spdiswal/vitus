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
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyModule("15b021ef72", { status: "passed" }),
	dummyModule("a3fdd8b6c3", { status: "running" }),
	dummyModule("-1730f876b4", { status: "passed" }),
	dummyModule("-e45b128829", { status: "passed" }),
])

beforeAll(() => {
	assertDummyProject(initialProject, { status: "running" })
})

describe.each`
	id               | expectedProjectStatus
	${"15b021ef72"}  | ${"running"}
	${"a3fdd8b6c3"}  | ${"failed"}
	${"-1730f876b4"} | ${"running"}
	${"-e45b128829"} | ${"running"}
`(
	"when an existing module with id $id has failed",
	(props: {
		id: ModuleId
		expectedProjectStatus: ProjectStatus
	}) => {
		let actualProject: Project
		let actualModule: Module

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				moduleFailedEvent({ id: props.id }),
			)

			const module = getModuleById(actualProject, props.id)
			assertNotNullish(module)
			actualModule = module
		})

		it("sets the module status to 'failed'", () => {
			expect(actualModule.status).toBe<ModuleStatus>("failed")
		})

		it("does not affect the number of modules in the project", () => {
			expect(actualProject.modules).toHaveLength(initialProject.modules.length)
		})

		it("does not affect the other modules in the project", () => {
			expect(getOtherModules(actualProject, props.id)).toEqual(
				getOtherModules(initialProject, props.id),
			)
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
			moduleFailedEvent({ id: "f9bb9e8bc0" }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
