import { applyProjectEvent } from "+events/ProjectEvent"
import { moduleDeletedEvent } from "+events/module/ModuleDeletedEvent"
import {
	type DummyModuleId,
	dummyModule,
	getDummyModulePath,
} from "+models/Module.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertDummyProject,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyModule("15b021ef72", { status: "passed" }),
	dummyModule("a3fdd8b6c3", { status: "passed" }),
	dummyModule("-1730f876b4", { status: "running" }),
	dummyModule("-e45b128829", { status: "passed" }),
])

beforeAll(() => {
	assertDummyProject(initialProject, { status: "running" })
})

describe.each`
	id               | expectedProjectStatus
	${"15b021ef72"}  | ${"running"}
	${"a3fdd8b6c3"}  | ${"running"}
	${"-1730f876b4"} | ${"passed"}
	${"-e45b128829"} | ${"running"}
`(
	"when an existing module $id has been deleted",
	(props: {
		id: DummyModuleId
		expectedProjectStatus: ProjectStatus
	}) => {
		const deletedPath = getDummyModulePath(props.id)

		let actualProject: Project

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				moduleDeletedEvent({ path: deletedPath }),
			)
		})

		it("forgets about the deleted module", () => {
			expect(actualProject.modules).toHaveLength(
				initialProject.modules.length - 1,
			)
			expect(actualProject.modules.map((module) => module.path)).not.toContain(
				deletedPath,
			)
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
			moduleDeletedEvent({
				path: "/Users/sdi/repositories/plantation/src/basket/Imaginary.tests.ts",
			}),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
