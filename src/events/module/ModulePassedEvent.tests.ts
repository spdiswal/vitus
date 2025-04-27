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
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyModule("15b021ef72", { status: "failed" }),
	dummyModule("a3fdd8b6c3", { status: "skipped" }),
	dummyModule("-1730f876b4", { status: "skipped" }),
	dummyModule("-e45b128829", { status: "skipped" }),
])

beforeAll(() => {
	assertDummyProject(initialProject, { status: "failed" })
})

describe.each`
	id               | expectedProjectStatus
	${"15b021ef72"}  | ${"passed"}
	${"a3fdd8b6c3"}  | ${"failed"}
	${"-1730f876b4"} | ${"failed"}
	${"-e45b128829"} | ${"failed"}
`(
	"when an existing module with id $id has passed",
	(props: {
		id: ModuleId
		expectedProjectStatus: ProjectStatus
	}) => {
		let actualProject: Project
		let actualModule: Module

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				modulePassedEvent({ id: props.id }),
			)

			const module = getModuleById(actualProject, props.id)
			assertNotNullish(module)
			actualModule = module
		})

		it("sets the module status to 'passed'", () => {
			expect(actualModule.status).toBe<ModuleStatus>("passed")
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

describe("when a non-existing module has passed", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyProjectEvent(
			initialProject,
			modulePassedEvent({ id: "f9bb9e8bc0" }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
