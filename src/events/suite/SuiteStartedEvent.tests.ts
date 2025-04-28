import { applyProjectEvent } from "+events/ProjectEvent"
import { suiteStartedEvent } from "+events/suite/SuiteStartedEvent"
import { type Module, getModuleById } from "+models/Module"
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
	suiteId                  | name                                              | expectedChildIdOrder
	${"15b021ef72_6"}        | ${"when the computer needs charging"}             | ${["15b021ef72_0", "15b021ef72_0_1", "15b021ef72_1", "15b021ef72_2", "15b021ef72_2_3", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_9", "15b021ef72_6"]}
	${"15b021ef72_0_2"}      | ${"when the smartphone needs charging"}           | ${["15b021ef72_0", "15b021ef72_0_1", "15b021ef72_0_2", "15b021ef72_1", "15b021ef72_2", "15b021ef72_2_3", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_9"]}
	${"15b021ef72_2_6_8"}    | ${"when the electric car needs charging"}         | ${["15b021ef72_0", "15b021ef72_0_1", "15b021ef72_1", "15b021ef72_2", "15b021ef72_2_3", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_8", "15b021ef72_2_6_9"]}
	${"3afdd8b6c3_8"}        | ${"when the fridge is out of soft drinks"}        | ${["3afdd8b6c3_0", "3afdd8b6c3_0_1", "3afdd8b6c3_0_3", "3afdd8b6c3_1", "3afdd8b6c3_2", "3afdd8b6c3_2_5", "3afdd8b6c3_2_6", "3afdd8b6c3_2_6_7", "3afdd8b6c3_2_6_9", "3afdd8b6c3_2_8", "3afdd8b6c3_2_8_1", "3afdd8b6c3_2_8_3", "3afdd8b6c3_2_8_4", "3afdd8b6c3_2_8_4_1", "3afdd8b6c3_3", "3afdd8b6c3_4", "3afdd8b6c3_4_5", "3afdd8b6c3_8"]}
	${"3afdd8b6c3_4_2"}      | ${"when the fridge is out of milk"}               | ${["3afdd8b6c3_0", "3afdd8b6c3_0_1", "3afdd8b6c3_0_3", "3afdd8b6c3_1", "3afdd8b6c3_2", "3afdd8b6c3_2_5", "3afdd8b6c3_2_6", "3afdd8b6c3_2_6_7", "3afdd8b6c3_2_6_9", "3afdd8b6c3_2_8", "3afdd8b6c3_2_8_1", "3afdd8b6c3_2_8_3", "3afdd8b6c3_2_8_4", "3afdd8b6c3_2_8_4_1", "3afdd8b6c3_3", "3afdd8b6c3_4", "3afdd8b6c3_4_2", "3afdd8b6c3_4_5"]}
	${"3afdd8b6c3_2_8_4_12"} | ${"when the fridge is out of apple juice"}        | ${["3afdd8b6c3_0", "3afdd8b6c3_0_1", "3afdd8b6c3_0_3", "3afdd8b6c3_1", "3afdd8b6c3_2", "3afdd8b6c3_2_5", "3afdd8b6c3_2_6", "3afdd8b6c3_2_6_7", "3afdd8b6c3_2_6_9", "3afdd8b6c3_2_8", "3afdd8b6c3_2_8_1", "3afdd8b6c3_2_8_3", "3afdd8b6c3_2_8_4", "3afdd8b6c3_2_8_4_1", "3afdd8b6c3_2_8_4_12", "3afdd8b6c3_3", "3afdd8b6c3_4", "3afdd8b6c3_4_5"]}
	${"-1730f876b4_4"}       | ${"when staying at the hotel"}                    | ${["-1730f876b4_0", "-1730f876b4_0_1", "-1730f876b4_0_3", "-1730f876b4_0_4", "-1730f876b4_0_4_5", "-1730f876b4_4", "-1730f876b4_7", "-1730f876b4_9"]}
	${"-1730f876b4_12"}      | ${"when the keyboard backlight is on"}            | ${["-1730f876b4_0", "-1730f876b4_0_1", "-1730f876b4_0_3", "-1730f876b4_0_4", "-1730f876b4_0_4_5", "-1730f876b4_7", "-1730f876b4_9", "-1730f876b4_12"]}
	${"-1730f876b4_0_14"}    | ${"when the mouse backlight is on"}               | ${["-1730f876b4_0", "-1730f876b4_0_1", "-1730f876b4_0_3", "-1730f876b4_0_4", "-1730f876b4_0_4_5", "-1730f876b4_0_14", "-1730f876b4_7", "-1730f876b4_9"]}
	${"-1730f876b4_0_4_10"}  | ${"when the mousepad backlight is on"}            | ${["-1730f876b4_0", "-1730f876b4_0_1", "-1730f876b4_0_3", "-1730f876b4_0_4", "-1730f876b4_0_4_5", "-1730f876b4_0_4_10", "-1730f876b4_7", "-1730f876b4_9"]}
	${"-e45b128829_0"}       | ${"when the bus is late"}                         | ${["-e45b128829_0", "-e45b128829_2", "-e45b128829_2_1", "-e45b128829_4", "-e45b128829_4_4", "-e45b128829_4_4_3", "-e45b128829_4_4_6", "-e45b128829_4_4_6_5"]}
	${"-e45b128829_20"}      | ${"when ordering a large meal with extra fries"}  | ${["-e45b128829_2", "-e45b128829_2_1", "-e45b128829_4", "-e45b128829_4_4", "-e45b128829_4_4_3", "-e45b128829_4_4_6", "-e45b128829_4_4_6_5", "-e45b128829_20"]}
	${"-e45b128829_2_0"}     | ${"when ordering a medium meal with extra salad"} | ${["-e45b128829_2", "-e45b128829_2_0", "-e45b128829_2_1", "-e45b128829_4", "-e45b128829_4_4", "-e45b128829_4_4_3", "-e45b128829_4_4_6", "-e45b128829_4_4_6_5"]}
	${"-e45b128829_4_4_6_8"} | ${"when ordering a small meal with extra sauce"}  | ${["-e45b128829_2", "-e45b128829_2_1", "-e45b128829_4", "-e45b128829_4_4", "-e45b128829_4_4_3", "-e45b128829_4_4_6", "-e45b128829_4_4_6_5", "-e45b128829_4_4_6_8"]}
`(
	"when a new suite with id $suiteId has started",
	(props: {
		suiteId: DummySuiteId
		name: string
		expectedChildIdOrder: Array<string>
	}) => {
		const suiteId = props.suiteId
		const [moduleId, parentSuiteId] = dummyParentIds(suiteId)

		const initialModule = getModuleById(initialProject, moduleId)
		assertNotNullish(initialModule)

		let actualProject: Project
		let actualModule: Module
		let actualSuite: Suite

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				suiteStartedEvent({
					type: "suite",
					id: suiteId,
					parentId: parentSuiteId ?? moduleId,
					parentModuleId: moduleId,
					name: props.name,
					status: "started",
				}),
			)

			const module = getModuleById(actualProject, moduleId)
			assertNotNullish(module)
			actualModule = module

			const suite = getSubtaskById(actualProject, suiteId)
			assertNotNullish(suite)
			assertSuite(suite)
			actualSuite = suite
		})

		it("sets the suite status to 'started'", () => {
			expect(actualSuite.status).toBe<TaskStatus>("started")
		})

		it("adds the suite to the module", () => {
			const actualSubtaskIds = Object.keys(actualProject.subtasksById)
			const initialSubtaskIds = Object.keys(initialProject.subtasksById)

			expect(actualSubtaskIds).toHaveLength(initialSubtaskIds.length + 1)
			expect(actualSubtaskIds).toContain(suiteId)
		})

		it("does not affect the module status", () => {
			expect(actualModule.status).toBe(initialModule.status)
		})
	},
)

describe.each`
	suiteId                | name
	${"15b021ef72_0"}      | ${"when the fruit basket has no apples"}
	${"15b021ef72_2"}      | ${"when the spring break is over"}
	${"15b021ef72_2_6"}    | ${"and the fridge is out of apple juice"}
	${"3afdd8b6c3_2"}      | ${"when the summer break is over"}
	${"3afdd8b6c3_0"}      | ${"when the fruit basket has no bananas"}
	${"3afdd8b6c3_2_6"}    | ${"and the fridge is out of banana smoothies"}
	${"3afdd8b6c3_2_8_4"}  | ${"and the music stops playing"}
	${"-1730f876b4_0"}     | ${"when the fruit basket has no oranges"}
	${"-1730f876b4_0_4"}   | ${"and the movie starts playing"}
	${"-e45b128829_2"}     | ${"when the winter break is over"}
	${"-e45b128829_4_4"}   | ${"and the movie stops playing"}
	${"-e45b128829_4_4_6"} | ${"and the fridge is out of peach smoothies"}
`(
	"when an existing suite with id $suiteId has started",
	(props: {
		suiteId: DummySuiteId
		name: string
	}) => {
		const suiteId = props.suiteId
		const [moduleId] = dummyParentIds(suiteId)

		const initialModule = getModuleById(initialProject, moduleId)
		assertNotNullish(initialModule)

		const initialSuite = getSubtaskById(initialProject, suiteId)
		assertNotNullish(initialSuite)
		assertSuite(initialSuite)

		let actualProject: Project
		let actualModule: Module
		let actualSuite: Suite

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				suiteStartedEvent({ ...initialSuite, status: "started" }),
			)

			const module = getModuleById(actualProject, moduleId)
			assertNotNullish(module)
			actualModule = module

			const suite = getSubtaskById(actualProject, suiteId)
			assertNotNullish(suite)
			assertSuite(suite)
			actualSuite = suite
		})

		it("sets the suite status to 'started'", () => {
			expect(actualSuite.status).toBe<TaskStatus>("started")
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
	suiteId               | name
	${"15b021ef72_4_0"}   | ${"when the fruit basket has no cherries"}
	${"15b021ef72_2_4_0"} | ${"when the fruit basket has no grapes"}
	${"f9bb9e8bc0_0"}     | ${"when the fruit basket has no pears"}
	${"f9bb9e8bc0_0_0"}   | ${"when the fruit basket has no strawberries"}
`(
	"when a suite with id $suiteId in a non-existing parent has started",
	(props: {
		suiteId: DummySuiteId
		name: string
	}) => {
		const suiteId = props.suiteId
		const [moduleId, parentSuiteId] = dummyParentIds(suiteId)

		let actualProject: Project

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				suiteStartedEvent({
					type: "suite",
					id: suiteId,
					parentId: parentSuiteId ?? moduleId,
					parentModuleId: moduleId,
					name: "dummy suite",
					status: "started",
				}),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
