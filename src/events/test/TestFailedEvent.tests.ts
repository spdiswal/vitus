import { applyProjectEvent } from "+events/ProjectEvent"
import { testFailedEvent } from "+events/test/TestFailedEvent"
import { dummyParentIds } from "+models/Module.fixtures"
import type { Project } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { getSubtaskById } from "+models/Subtask"
import type { TaskStatus } from "+models/TaskStatus"
import { type Test, assertTest } from "+models/Test"
import type { DummyTestId } from "+models/Test.fixtures"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject()

describe.each`
	testId
	${"15b021ef72_1"}
	${"15b021ef72_0_1"}
	${"15b021ef72_2_6_9"}
	${"3afdd8b6c3_1"}
	${"3afdd8b6c3_3"}
	${"3afdd8b6c3_0_3"}
	${"3afdd8b6c3_2_6_7"}
	${"3afdd8b6c3_2_8_4_1"}
	${"-1730f876b4_7"}
	${"-1730f876b4_9"}
	${"-1730f876b4_0_1"}
	${"-1730f876b4_0_4_5"}
	${"-e45b128829_2_1"}
	${"-e45b128829_4_4_3"}
	${"-e45b128829_4_4_6_5"}
`(
	"when a test with id $testId has failed",
	(props: {
		testId: DummyTestId
	}) => {
		const testId = props.testId
		const [moduleId] = dummyParentIds(testId)

		const initialTest = getSubtaskById(initialProject, testId)
		assertNotNullish(initialTest)
		assertTest(initialTest)

		let actualProject: Project
		let actualTest: Test

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				testFailedEvent({ ...initialTest, status: "failed" }),
			)

			const test = getSubtaskById(actualProject, testId)
			assertNotNullish(test)
			assertTest(test)
			actualTest = test
		})

		it("sets the test status to 'failed'", () => {
			expect(actualTest.status).toBe<TaskStatus>("failed")
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
	testId
	${"-1730f876b4_0_5"}
	${"-1730f876b4_0_4_9"}
	${"f9bb9e8bc0_1"}
	${"f9bb9e8bc0_0_1"}
`(
	"when a non-existing test with id $testId has failed",
	(props: {
		testId: DummyTestId
	}) => {
		const testId = props.testId
		const [moduleId, suiteId] = dummyParentIds(testId)

		let actualProject: Project

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				testFailedEvent({
					type: "test",
					id: testId,
					parentId: suiteId ?? moduleId,
					parentModuleId: moduleId,
					name: "dummy test",
					status: "failed",
				}),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
