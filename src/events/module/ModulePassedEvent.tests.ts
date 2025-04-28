import { applyProjectEvent } from "+events/ProjectEvent"
import { modulePassedEvent } from "+events/module/ModulePassedEvent"
import { type Module, getModuleById } from "+models/Module"
import { dummyModulePath } from "+models/Module.fixtures"
import type { Project, ProjectStatus } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { TaskId } from "+models/TaskId"
import type { TaskStatus } from "+models/TaskStatus"
import { getFilenameFromPath } from "+types/Path"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({
	modulesById: {
		"15b021ef72": { status: "failed" },
		"3afdd8b6c3": { status: "skipped" },
		"-1730f876b4": { status: "skipped" },
		"-e45b128829": { status: "skipped" },
	},
})

describe.each`
	id               | expectedProjectStatus
	${"15b021ef72"}  | ${"passed"}
	${"3afdd8b6c3"}  | ${"failed"}
	${"-1730f876b4"} | ${"failed"}
	${"-e45b128829"} | ${"failed"}
`(
	"when an existing module with id $id has passed",
	(props: {
		id: TaskId
		expectedProjectStatus: ProjectStatus
	}) => {
		let actualProject: Project
		let actualModule: Module

		beforeEach(() => {
			const initialModule = getModuleById(initialProject, props.id)
			assertNotNullish(initialModule)

			actualProject = applyProjectEvent(
				initialProject,
				modulePassedEvent({ ...initialModule, status: "passed" }),
			)

			const module = getModuleById(actualProject, props.id)
			assertNotNullish(module)
			actualModule = module
		})

		it("sets the module status to 'passed'", () => {
			expect(actualModule.status).toBe<TaskStatus>("passed")
		})

		it("does not affect the set of modules in the project", () => {
			const actualModuleIds = Object.keys(actualProject.modulesById)
			const initialModuleIds = Object.keys(initialProject.modulesById)

			expect(actualModuleIds).toHaveLength(initialModuleIds.length)
		})

		it("does not affect the other modules in the project", () => {
			const { [props.id]: initialUpdatedModule, ...initialOtherModules } =
				initialProject.modulesById

			const { [props.id]: actualUpdatedModule, ...actualOtherModules } =
				actualProject.modulesById

			expect(actualOtherModules).toEqual(initialOtherModules)
		})

		it("updates the project status based on the latest set of modules", () => {
			expect(actualProject.status).toBe(props.expectedProjectStatus)
		})
	},
)

describe("when a non-existing module has passed", () => {
	let actualProject: Project

	beforeEach(() => {
		const path = dummyModulePath("f9bb9e8bc0")

		actualProject = applyProjectEvent(
			initialProject,
			modulePassedEvent({
				type: "module",
				id: "f9bb9e8bc0",
				path,
				filename: getFilenameFromPath(path),
				status: "passed",
			}),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
