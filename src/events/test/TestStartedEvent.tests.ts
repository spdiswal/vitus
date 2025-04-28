import { applyProjectEvent } from "+events/ProjectEvent"
import { testStartedEvent } from "+events/test/TestStartedEvent"
import { type Module, getModuleById } from "+models/Module"
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
	testId                   | name                             | expectedChildIdOrder
	${"15b021ef72_57"}       | ${"asks for directions"}         | ${["15b021ef72_0", "15b021ef72_0_1", "15b021ef72_1", "15b021ef72_2", "15b021ef72_2_3", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_9", "15b021ef72_57"]}
	${"15b021ef72_0_3"}      | ${"finds the hidden door"}       | ${["15b021ef72_0", "15b021ef72_0_1", "15b021ef72_0_3", "15b021ef72_1", "15b021ef72_2", "15b021ef72_2_3", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_9"]}
	${"15b021ef72_2_1"}      | ${"navigates the labyrinth"}     | ${["15b021ef72_0", "15b021ef72_0_1", "15b021ef72_1", "15b021ef72_2", "15b021ef72_2_1", "15b021ef72_2_3", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_9"]}
	${"15b021ef72_2_6_13"}   | ${"explores the unknown"}        | ${["15b021ef72_0", "15b021ef72_0_1", "15b021ef72_1", "15b021ef72_2", "15b021ef72_2_3", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_9", "15b021ef72_2_6_13"]}
	${"3afdd8b6c3_5"}        | ${"jumps over the lazy dog"}     | ${["3afdd8b6c3_0", "3afdd8b6c3_0_1", "3afdd8b6c3_0_3", "3afdd8b6c3_1", "3afdd8b6c3_2", "3afdd8b6c3_2_5", "3afdd8b6c3_2_6", "3afdd8b6c3_2_6_7", "3afdd8b6c3_2_6_9", "3afdd8b6c3_2_8", "3afdd8b6c3_2_8_1", "3afdd8b6c3_2_8_3", "3afdd8b6c3_2_8_4", "3afdd8b6c3_2_8_4_1", "3afdd8b6c3_3", "3afdd8b6c3_4", "3afdd8b6c3_4_5", "3afdd8b6c3_5"]}
	${"3afdd8b6c3_0_7"}      | ${"climbs the highest mountain"} | ${["3afdd8b6c3_0", "3afdd8b6c3_0_1", "3afdd8b6c3_0_3", "3afdd8b6c3_0_7", "3afdd8b6c3_1", "3afdd8b6c3_2", "3afdd8b6c3_2_5", "3afdd8b6c3_2_6", "3afdd8b6c3_2_6_7", "3afdd8b6c3_2_6_9", "3afdd8b6c3_2_8", "3afdd8b6c3_2_8_1", "3afdd8b6c3_2_8_3", "3afdd8b6c3_2_8_4", "3afdd8b6c3_2_8_4_1", "3afdd8b6c3_3", "3afdd8b6c3_4", "3afdd8b6c3_4_5"]}
	${"3afdd8b6c3_2_6_13"}   | ${"dives into the trench"}       | ${["3afdd8b6c3_0", "3afdd8b6c3_0_1", "3afdd8b6c3_0_3", "3afdd8b6c3_1", "3afdd8b6c3_2", "3afdd8b6c3_2_5", "3afdd8b6c3_2_6", "3afdd8b6c3_2_6_7", "3afdd8b6c3_2_6_9", "3afdd8b6c3_2_6_13", "3afdd8b6c3_2_8", "3afdd8b6c3_2_8_1", "3afdd8b6c3_2_8_3", "3afdd8b6c3_2_8_4", "3afdd8b6c3_2_8_4_1", "3afdd8b6c3_3", "3afdd8b6c3_4", "3afdd8b6c3_4_5"]}
	${"3afdd8b6c3_2_8_4_3"}  | ${"solves the puzzle"}           | ${["3afdd8b6c3_0", "3afdd8b6c3_0_1", "3afdd8b6c3_0_3", "3afdd8b6c3_1", "3afdd8b6c3_2", "3afdd8b6c3_2_5", "3afdd8b6c3_2_6", "3afdd8b6c3_2_6_7", "3afdd8b6c3_2_6_9", "3afdd8b6c3_2_8", "3afdd8b6c3_2_8_1", "3afdd8b6c3_2_8_3", "3afdd8b6c3_2_8_4", "3afdd8b6c3_2_8_4_1", "3afdd8b6c3_2_8_4_3", "3afdd8b6c3_3", "3afdd8b6c3_4", "3afdd8b6c3_4_5"]}
	${"-1730f876b4_1"}       | ${"empties the swimming pool"}   | ${["-1730f876b4_0", "-1730f876b4_0_1", "-1730f876b4_0_3", "-1730f876b4_0_4", "-1730f876b4_0_4_5", "-1730f876b4_1", "-1730f876b4_7", "-1730f876b4_9"]}
	${"-1730f876b4_53"}      | ${"makes a wish list"}           | ${["-1730f876b4_0", "-1730f876b4_0_1", "-1730f876b4_0_3", "-1730f876b4_0_4", "-1730f876b4_0_4_5", "-1730f876b4_7", "-1730f876b4_9", "-1730f876b4_53"]}
	${"-1730f876b4_0_5"}     | ${"replaces the broken faucet"}  | ${["-1730f876b4_0", "-1730f876b4_0_1", "-1730f876b4_0_3", "-1730f876b4_0_4", "-1730f876b4_0_4_5", "-1730f876b4_0_5", "-1730f876b4_7", "-1730f876b4_9"]}
	${"-1730f876b4_0_4_9"}   | ${"opens a new bank account"}    | ${["-1730f876b4_0", "-1730f876b4_0_1", "-1730f876b4_0_3", "-1730f876b4_0_4", "-1730f876b4_0_4_5", "-1730f876b4_0_4_9", "-1730f876b4_7", "-1730f876b4_9"]}
	${"-e45b128829_1"}       | ${"selects a winner"}            | ${["-e45b128829_1", "-e45b128829_2", "-e45b128829_2_1", "-e45b128829_4", "-e45b128829_4_4", "-e45b128829_4_4_3", "-e45b128829_4_4_6", "-e45b128829_4_4_6_5"]}
	${"-e45b128829_11"}      | ${"completes the purchase"}      | ${["-e45b128829_2", "-e45b128829_2_1", "-e45b128829_4", "-e45b128829_4_4", "-e45b128829_4_4_3", "-e45b128829_4_4_6", "-e45b128829_4_4_6_5", "-e45b128829_11"]}
	${"-e45b128829_2_3"}     | ${"retrieves a lost package"}    | ${["-e45b128829_2", "-e45b128829_2_1", "-e45b128829_2_3", "-e45b128829_4", "-e45b128829_4_4", "-e45b128829_4_4_3", "-e45b128829_4_4_6", "-e45b128829_4_4_6_5"]}
	${"-e45b128829_4_4_7"}   | ${"decrypts the messages"}       | ${["-e45b128829_2", "-e45b128829_2_1", "-e45b128829_4", "-e45b128829_4_4", "-e45b128829_4_4_3", "-e45b128829_4_4_6", "-e45b128829_4_4_6_5", "-e45b128829_4_4_7"]}
	${"-e45b128829_4_4_6_1"} | ${"finds the treasure"}          | ${["-e45b128829_2", "-e45b128829_2_1", "-e45b128829_4", "-e45b128829_4_4", "-e45b128829_4_4_3", "-e45b128829_4_4_6", "-e45b128829_4_4_6_1", "-e45b128829_4_4_6_5"]}
`(
	"when a new test with id $testId has started",
	(props: {
		testId: DummyTestId
		name: string
		expectedChildIdOrder: Array<string>
	}) => {
		const testId = props.testId
		const [moduleId, suiteId] = dummyParentIds(testId)

		const initialModule = getModuleById(initialProject, moduleId)
		assertNotNullish(initialModule)

		let actualProject: Project
		let actualModule: Module
		let actualTest: Test

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				testStartedEvent({
					type: "test",
					id: testId,
					parentId: suiteId ?? moduleId,
					parentModuleId: moduleId,
					name: props.name,
					status: "started",
				}),
			)

			const module = getModuleById(actualProject, moduleId)
			assertNotNullish(module)
			actualModule = module

			const test = getSubtaskById(actualProject, testId)
			assertNotNullish(test)
			assertTest(test)
			actualTest = test
		})

		it("sets the test status to 'started'", () => {
			expect(actualTest.status).toBe<TaskStatus>("started")
		})

		it("adds the suite to the module", () => {
			const actualSubtaskIds = Object.keys(actualProject.subtasksById)
			const initialSubtaskIds = Object.keys(initialProject.subtasksById)

			expect(actualSubtaskIds).toHaveLength(initialSubtaskIds.length + 1)
			expect(actualSubtaskIds).toContain(testId)
		})

		it("does not affect the module status", () => {
			expect(actualModule.status).toBe(initialModule.status)
		})
	},
)

describe.each`
	testId                   | name
	${"15b021ef72_1"}        | ${"pours a cup of apple juice"}
	${"15b021ef72_2_3"}      | ${"changes the batteries"}
	${"15b021ef72_2_6_7"}    | ${"turns the ceiling lights on"}
	${"3afdd8b6c3_3"}        | ${"recharges the smartphone"}
	${"3afdd8b6c3_2_5"}      | ${"refills the basket with fresh bananas"}
	${"3afdd8b6c3_2_6_7"}    | ${"turns the floor lamps on"}
	${"3afdd8b6c3_2_8_4_1"}  | ${"pours a cup of banana smoothie"}
	${"-1730f876b4_7"}       | ${"turns the outdoor lights on"}
	${"-1730f876b4_9"}       | ${"moves one tile to the south"}
	${"-1730f876b4_0_1"}     | ${"pours a cup of orange juice"}
	${"-1730f876b4_0_3"}     | ${"plugs in the power cord"}
	${"-1730f876b4_0_4_5"}   | ${"refills the basket with fresh oranges"}
	${"-e45b128829_2_1"}     | ${"pours a cup of peach smoothie"}
	${"-e45b128829_4_4_3"}   | ${"amplifies the signal"}
	${"-e45b128829_4_4_6_5"} | ${"refills the basket with fresh peaches"}
`(
	"when an existing test with id $testId has started",
	(props: {
		testId: DummyTestId
		name: string
	}) => {
		const testId = props.testId
		const [moduleId] = dummyParentIds(testId)

		const initialModule = getModuleById(initialProject, moduleId)
		assertNotNullish(initialModule)

		const initialTest = getSubtaskById(initialProject, testId)
		assertNotNullish(initialTest)
		assertTest(initialTest)

		let actualProject: Project
		let actualModule: Module
		let actualTest: Test

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				testStartedEvent({
					...initialTest,
					name: props.name,
					status: "started",
				}),
			)

			const module = getModuleById(actualProject, moduleId)
			assertNotNullish(module)
			actualModule = module

			const test = getSubtaskById(actualProject, testId)
			assertNotNullish(test)
			assertTest(test)
			actualTest = test
		})

		it("sets the test status to 'started'", () => {
			expect(actualTest.status).toBe<TaskStatus>("started")
		})

		it("does not affect the set of suites and tests in the project", () => {
			const actualSubtaskIds = Object.keys(actualProject.subtasksById)
			const initialSubtaskIds = Object.keys(initialProject.subtasksById)

			expect(actualSubtaskIds).toEqual(initialSubtaskIds)
		})

		it("does not affect the module status", () => {
			expect(actualModule.status).toBe(initialModule.status)
		})
	},
)

describe.each`
	testId                | name
	${"15b021ef72_4_1"}   | ${"makes a cherry smoothie"}
	${"15b021ef72_2_4_1"} | ${"makes a grape smoothie"}
	${"f9bb9e8bc0_1"}     | ${"makes a pear smoothie"}
	${"f9bb9e8bc0_0_1"}   | ${"makes a strawberry smoothie"}
`(
	"when a test with id $testId in a non-existing parent has started",
	(props: {
		testId: DummyTestId
		name: string
	}) => {
		const testId = props.testId
		const [moduleId, suiteId] = dummyParentIds(testId)

		let actualProject: Project

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				testStartedEvent({
					type: "test",
					id: testId,
					parentId: suiteId ?? moduleId,
					parentModuleId: moduleId,
					name: props.name,
					status: "started",
				}),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
