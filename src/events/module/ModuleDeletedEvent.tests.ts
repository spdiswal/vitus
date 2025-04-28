import { applyProjectEvent } from "+events/ProjectEvent"
import { moduleDeletedEvent } from "+events/module/ModuleDeletedEvent"
import { type DummyModuleId, dummyModulePath } from "+models/Module.fixtures"
import type { Project, ProjectStatus } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({
	status: "started",
	modulesById: {
		"15b021ef72": { status: "passed" },
		"3afdd8b6c3": { status: "passed" },
		"-1730f876b4": { status: "started" },
		"-e45b128829": { status: "passed" },
	},
})

describe.each`
	id               | expectedProjectStatus
	${"15b021ef72"}  | ${"started"}
	${"3afdd8b6c3"}  | ${"started"}
	${"-1730f876b4"} | ${"passed"}
	${"-e45b128829"} | ${"started"}
`(
	"when an existing module $id has been deleted",
	(props: {
		id: DummyModuleId
		expectedProjectStatus: ProjectStatus
	}) => {
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				moduleDeletedEvent(dummyModulePath(props.id)),
			)
		})

		it("forgets about the deleted module", () => {
			const actualModuleIds = Object.keys(actualProject.modulesById)
			const initialModuleIds = Object.keys(initialProject.modulesById)

			expect(actualModuleIds).toHaveLength(initialModuleIds.length - 1)
			expect(actualModuleIds).not.toContain(props.id)
		})

		it("updates the project status based on the latest set of modules", () => {
			expect(actualProject.status).toBe(props.expectedProjectStatus)
		})
	},
)

describe("when a non-existing module has been deleted", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyProjectEvent(
			initialProject,
			moduleDeletedEvent(dummyModulePath("f9bb9e8bc0")),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
