import { applyProjectEvent } from "+events/ProjectEvent"
import { moduleSkippedEvent } from "+events/module/ModuleSkippedEvent"
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
		"15b021ef72": { status: "passed" },
		"3afdd8b6c3": { status: "passed" },
		"-1730f876b4": { status: "passed" },
		"-e45b128829": { status: "running" },
	},
})

describe.each`
	id               | expectedProjectStatus
	${"15b021ef72"}  | ${"running"}
	${"3afdd8b6c3"}  | ${"running"}
	${"-1730f876b4"} | ${"running"}
	${"-e45b128829"} | ${"passed"}
`(
	"when an existing module with id $id has been skipped",
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
				moduleSkippedEvent({ ...initialModule, status: "skipped" }),
			)

			const module = getModuleById(actualProject, props.id)
			assertNotNullish(module)
			actualModule = module
		})

		it("sets the module status to 'skipped'", () => {
			expect(actualModule.status).toBe<TaskStatus>("skipped")
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

describe("when a non-existing module has been skipped", () => {
	let actualProject: Project

	beforeEach(() => {
		const path = dummyModulePath("f9bb9e8bc0")

		actualProject = applyProjectEvent(
			initialProject,
			moduleSkippedEvent({
				type: "module",
				id: "f9bb9e8bc0",
				path,
				filename: getFilenameFromPath(path),
				status: "skipped",
			}),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
