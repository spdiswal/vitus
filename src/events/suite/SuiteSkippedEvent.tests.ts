import { applyProjectEvent } from "+events/ProjectEvent"
import { suiteSkippedEvent } from "+events/suite/SuiteSkippedEvent"
import { dummyParentIds } from "+models/Module.fixtures"
import type { Project } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { getSubtaskById } from "+models/Subtask"
import { type Suite, assertSuite } from "+models/Suite"
import type { DummySuiteId } from "+models/Suite.fixtures"
import type { TaskStatus } from "+models/TaskStatus"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject()

describe.each`
	suiteId
	${"15b021ef72_0"}
	${"15b021ef72_2"}
	${"15b021ef72_2_6"}
	${"3afdd8b6c3_0"}
	${"3afdd8b6c3_4"}
	${"3afdd8b6c3_2_6"}
	${"3afdd8b6c3_2_8"}
	${"3afdd8b6c3_2_8_4"}
	${"-1730f876b4_0"}
	${"-1730f876b4_0_4"}
	${"-e45b128829_2"}
	${"-e45b128829_4_4"}
	${"-e45b128829_4_4_6"}
`(
	"when a suite with id $suiteId has been skipped",
	(props: { suiteId: DummySuiteId }) => {
		const suiteId = props.suiteId
		const [moduleId] = dummyParentIds(suiteId)

		const initialSuite = getSubtaskById(initialProject, suiteId)
		assertNotNullish(initialSuite)
		assertSuite(initialSuite)

		let actualProject: Project
		let actualSuite: Suite

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				suiteSkippedEvent({ ...initialSuite, status: "skipped" }),
			)

			const suite = getSubtaskById(actualProject, suiteId)
			assertNotNullish(suite)
			assertSuite(suite)
			actualSuite = suite
		})

		it("sets the suite status to 'skipped'", () => {
			expect(actualSuite.status).toBe<TaskStatus>("skipped")
		})

		it("does not affect the set of suites and tests in the project", () => {
			const actualSubtaskIds = Object.keys(actualProject.subtasksById)
			const initialSubtaskIds = Object.keys(initialProject.subtasksById)

			expect(actualSubtaskIds).toEqual(initialSubtaskIds)
		})

		it("does not affect the other modules in the project", () => {
			const { [moduleId]: initialUpdatedModule, ...initialOtherModules } =
				initialProject.modulesById

			const { [moduleId]: actualUpdatedModule, ...actualOtherModules } =
				actualProject.modulesById

			expect(actualOtherModules).toEqual(initialOtherModules)
		})
	},
)

describe.each`
	suiteId
	${"15b021ef72_8"}
	${"15b021ef72_8_4"}
	${"f9bb9e8bc0_0"}
	${"f9bb9e8bc0_0_0"}
`(
	"when a non-existing suite with id $suiteId has been skipped",
	(props: { suiteId: DummySuiteId }) => {
		const suiteId = props.suiteId
		const [moduleId] = dummyParentIds(suiteId)

		let actualProject: Project

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				suiteSkippedEvent({
					type: "suite",
					id: suiteId,
					parentId: moduleId,
					parentModuleId: moduleId,
					name: "dummy suite",
					status: "skipped",
				}),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
