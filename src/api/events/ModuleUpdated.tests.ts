import { applyEvent } from "+api/events/Event"
import { moduleUpdated } from "+api/events/ModuleUpdated"
import { type Module, getModuleById } from "+api/models/Module"
import {
	type NonExistingDummyModuleId,
	dummyModuleFilename,
	dummyModulePath,
} from "+api/models/Module.fixtures"
import type { ModuleId } from "+api/models/ModuleId"
import type { Project } from "+api/models/Project"
import { dummyProject } from "+api/models/Project.fixtures"
import { getSubtasks } from "+api/models/Subtask"
import { bySubtaskIds } from "+api/models/SubtaskId"
import type { DummySuiteId } from "+api/models/Suite.fixtures"
import {
	type TaskStatus,
	failed,
	passed,
	skipped,
	started,
} from "+api/models/TaskStatus"
import type { DummyTestId } from "+api/models/Test.fixtures"
import { not } from "+utilities/Predicates"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({
	status: "skipped",
	modulesById: {
		"15b021ef72": { status: skipped() },
		"3afdd8b6c3": { status: skipped() },
		"-1730f876b4": { status: skipped() },
		"-e45b128829": { status: skipped() },
	},
})

describe.each`
	moduleId         | status       | expectedDiscardedSubtaskIds
	${"15b021ef72"}  | ${failed(7)} | ${["15b021ef72_1", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_9"]}
	${"3afdd8b6c3"}  | ${passed(2)} | ${["3afdd8b6c3_0", "3afdd8b6c3_0_1", "3afdd8b6c3_0_3", "3afdd8b6c3_1", "3afdd8b6c3_2_6_7", "3afdd8b6c3_2_8", "3afdd8b6c3_2_8_1", "3afdd8b6c3_2_8_3", "3afdd8b6c3_2_8_4", "3afdd8b6c3_2_8_4_1", "3afdd8b6c3_4_5"]}
	${"-1730f876b4"} | ${skipped()} | ${["-1730f876b4_0_1", "-1730f876b4_0_4", "-1730f876b4_0_4_5", "-1730f876b4_9"]}
	${"-e45b128829"} | ${started()} | ${[]}
`(
	"when an existing module with id $moduleId has $status.type",
	(props: {
		moduleId: ModuleId
		status: TaskStatus
		expectedDiscardedSubtaskIds: Array<DummySuiteId | DummyTestId>
	}) => {
		const moduleId = props.moduleId
		const discardedSubtaskIds = props.expectedDiscardedSubtaskIds
		const affectedSubtaskIds = discardedSubtaskIds

		let actualProject: Project
		let actualModule: Module

		beforeEach(() => {
			const initialModule = getModuleById(initialProject, moduleId)
			const updatedModule: Module = {
				...initialModule,
				status: props.status,
			}

			actualProject = applyEvent(initialProject, moduleUpdated(updatedModule))
			actualModule = getModuleById(actualProject, moduleId)
		})

		it(`sets the module status to '${props.status.type}'`, () => {
			expect(actualModule.status).toBe(props.status)
		})

		it("does not affect the project status", () => {
			expect(actualProject.status).toBe(initialProject.status)
		})

		it("does not affect the other modules in the project", () => {
			const { [moduleId]: initialUpdatedModule, ...initialOtherModules } =
				initialProject.modulesById

			const { [moduleId]: actualUpdatedModule, ...actualOtherModules } =
				actualProject.modulesById

			expect(actualOtherModules).toEqual(initialOtherModules)
		})

		it("discards unfinished subtasks in the module", () => {
			const actualSubtasks = getSubtasks(
				actualProject,
				bySubtaskIds(discardedSubtaskIds),
			)

			expect(actualSubtasks).toEqual([])
		})

		it("does not affect the other subtasks in the project", () => {
			const initialOtherSubtasks = getSubtasks(
				initialProject,
				not(bySubtaskIds(affectedSubtaskIds)),
			)
			const actualOtherSubtasks = getSubtasks(
				actualProject,
				not(bySubtaskIds(affectedSubtaskIds)),
			)

			expect(actualOtherSubtasks).toEqual(initialOtherSubtasks)
		})
	},
)

describe.each`
	moduleId         | status
	${"134672b00e"}  | ${failed(10)}
	${"29bb9e8bc0"}  | ${passed(4)}
	${"-20e94f4789"} | ${skipped()}
	${"6ab50b9861"}  | ${started()}
`(
	"when a non-existing module with id $moduleId has $status.type",
	(props: {
		moduleId: NonExistingDummyModuleId
		status: TaskStatus
	}) => {
		const moduleId = props.moduleId

		let actualProject: Project
		let actualModule: Module

		beforeEach(() => {
			const newModule: Module = {
				type: "module",
				id: moduleId,
				path: dummyModulePath(moduleId),
				filename: dummyModuleFilename(moduleId),
				status: props.status,
			}

			actualProject = applyEvent(initialProject, moduleUpdated(newModule))
			actualModule = getModuleById(actualProject, moduleId)
		})

		it(`sets the module status to '${props.status.type}'`, () => {
			expect(actualModule.status).toBe(props.status)
		})

		it("does not affect the project status", () => {
			expect(actualProject.status).toBe(initialProject.status)
		})

		it("adds the module to the project", () => {
			const initialModuleIds = Object.keys(initialProject.modulesById)
			const actualModuleIds = Object.keys(actualProject.modulesById)

			expect(actualModuleIds).toEqual([...initialModuleIds, moduleId])
		})

		it("does not affect the other modules in the project", () => {
			const initialOtherModules = initialProject.modulesById

			const { [moduleId]: actualNewModule, ...actualOtherModules } =
				actualProject.modulesById

			expect(actualOtherModules).toEqual(initialOtherModules)
		})

		it("does not affect the subtasks in the project", () => {
			const initialSubtasks = initialProject.subtasksById
			const actualSubtasks = actualProject.subtasksById

			expect(actualSubtasks).toEqual(initialSubtasks)
		})
	},
)
