import { applyEvent } from "+api/events/Event"
import { moduleDeleted } from "+api/events/ModuleDeleted"
import {
	type DummyModuleId,
	type NonExistingDummyModuleId,
	dummyModulePath,
} from "+api/models/Module.fixtures"
import type { Project } from "+api/models/Project"
import { dummyProject } from "+api/models/Project.fixtures"
import type { ProjectStatus } from "+api/models/ProjectStatus"
import { passed, started } from "+api/models/TaskStatus"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({
	status: "started",
	modulesById: {
		"15b021ef72": { status: passed(1) },
		"3afdd8b6c3": { status: passed(2) },
		"-1730f876b4": { status: started() },
		"-e45b128829": { status: passed(4) },
	},
})

describe.each`
	moduleId         | expectedProjectStatus
	${"15b021ef72"}  | ${"started"}
	${"3afdd8b6c3"}  | ${"started"}
	${"-1730f876b4"} | ${"passed"}
	${"-e45b128829"} | ${"started"}
`(
	"when an existing module $moduleId has been deleted",
	(props: {
		moduleId: DummyModuleId
		expectedProjectStatus: ProjectStatus
	}) => {
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				moduleDeleted(dummyModulePath(props.moduleId)),
			)
		})

		it("forgets about the deleted module", () => {
			const actualModuleIds = Object.keys(actualProject.modulesById)
			const initialModuleIds = Object.keys(initialProject.modulesById)

			expect(actualModuleIds).toHaveLength(initialModuleIds.length - 1)
			expect(actualModuleIds).not.toContain(props.moduleId)
		})

		it("updates the project status based on the latest set of modules", () => {
			expect(actualProject.status).toBe(props.expectedProjectStatus)
		})
	},
)

describe.each`
	moduleId
	${"134672b00e"}
	${"29bb9e8bc0"}
	${"-20e94f4789"}
	${"6ab50b9861"}
`(
	"when a non-existing module with id $moduleId has been deleted",
	(props: {
		moduleId: NonExistingDummyModuleId
	}) => {
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				moduleDeleted(dummyModulePath(props.moduleId)),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
