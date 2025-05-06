import { applyEvent } from "+api/events/Event"
import { subtaskUpdated } from "+api/events/SubtaskUpdated"
import { dummyParentIds } from "+api/models/Module.fixtures"
import type { Project } from "+api/models/Project"
import { dummyProject } from "+api/models/Project.fixtures"
import { type Subtask, getSubtaskById, getSubtasks } from "+api/models/Subtask"
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

const initialProject = dummyProject()

describe.each`
	subtaskId                | status        | expectedDiscardedSubtaskIds
	${"15b021ef72_0"}        | ${failed(8)}  | ${[]}
	${"15b021ef72_0_1"}      | ${passed(6)}  | ${[]}
	${"15b021ef72_1"}        | ${skipped()}  | ${[]}
	${"15b021ef72_2"}        | ${started()}  | ${[]}
	${"15b021ef72_2_6"}      | ${failed(2)}  | ${["15b021ef72_2_6_9"]}
	${"15b021ef72_2_6_9"}    | ${passed(3)}  | ${[]}
	${"3afdd8b6c3_0"}        | ${skipped()}  | ${["3afdd8b6c3_0_1"]}
	${"3afdd8b6c3_0_3"}      | ${started()}  | ${[]}
	${"3afdd8b6c3_1"}        | ${failed(15)} | ${[]}
	${"3afdd8b6c3_2"}        | ${passed(10)} | ${["3afdd8b6c3_2_8", "3afdd8b6c3_2_8_1", "3afdd8b6c3_2_8_3", "3afdd8b6c3_2_8_4", "3afdd8b6c3_2_8_4_1"]}
	${"3afdd8b6c3_2_6"}      | ${skipped()}  | ${["3afdd8b6c3_2_6_7"]}
	${"3afdd8b6c3_2_6_7"}    | ${started()}  | ${[]}
	${"3afdd8b6c3_2_8"}      | ${failed(13)} | ${["3afdd8b6c3_2_8_1"]}
	${"3afdd8b6c3_2_8_4"}    | ${passed(18)} | ${["3afdd8b6c3_2_8_4_1"]}
	${"3afdd8b6c3_2_8_4_1"}  | ${skipped()}  | ${[]}
	${"3afdd8b6c3_3"}        | ${started()}  | ${[]}
	${"3afdd8b6c3_4"}        | ${failed(5)}  | ${["3afdd8b6c3_4_5"]}
	${"-1730f876b4_0"}       | ${passed(4)}  | ${["-1730f876b4_0_1", "-1730f876b4_0_4", "-1730f876b4_0_4_5"]}
	${"-1730f876b4_0_1"}     | ${skipped()}  | ${[]}
	${"-1730f876b4_0_4"}     | ${started()}  | ${[]}
	${"-1730f876b4_0_4_5"}   | ${failed(8)}  | ${[]}
	${"-1730f876b4_7"}       | ${passed(2)}  | ${[]}
	${"-1730f876b4_9"}       | ${skipped()}  | ${[]}
	${"-e45b128829_2"}       | ${started()}  | ${[]}
	${"-e45b128829_2_1"}     | ${failed(11)} | ${[]}
	${"-e45b128829_4"}       | ${passed(16)} | ${["-e45b128829_4_4", "-e45b128829_4_4_3", "-e45b128829_4_4_6", "-e45b128829_4_4_6_5"]}
	${"-e45b128829_4_4"}     | ${skipped()}  | ${[]}
	${"-e45b128829_4_4_3"}   | ${started()}  | ${[]}
	${"-e45b128829_4_4_6"}   | ${failed(25)} | ${[]}
	${"-e45b128829_4_4_6_5"} | ${passed(22)} | ${[]}
`(
	"when an existing subtask with id $subtaskId has $status.type",
	(props: {
		subtaskId: DummySuiteId | DummyTestId
		status: TaskStatus
		expectedDiscardedSubtaskIds: Array<DummySuiteId | DummyTestId>
	}) => {
		const subtaskId = props.subtaskId
		const discardedSubtaskIds = props.expectedDiscardedSubtaskIds
		const affectedSubtaskIds = [subtaskId, ...discardedSubtaskIds]

		let actualProject: Project
		let actualSubtask: Subtask

		beforeEach(() => {
			const initialSubtask = getSubtaskById(initialProject, subtaskId)
			const updatedSubtask: Subtask = {
				...initialSubtask,
				status: props.status,
			}

			actualProject = applyEvent(initialProject, subtaskUpdated(updatedSubtask))
			actualSubtask = getSubtaskById(actualProject, subtaskId)
		})

		it(`sets the subtask status to '${props.status.type}'`, () => {
			expect(actualSubtask.status).toBe(props.status)
		})

		it("does not affect the modules in the project", () => {
			const initialModules = initialProject.modulesById
			const actualModules = actualProject.modulesById

			expect(actualModules).toEqual(initialModules)
		})

		it("discards unfinished nested subtasks in the subtask", () => {
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
	subtaskId              | newName
	${"15b021ef72_0"}      | ${"when the electric car needs charging"}
	${"15b021ef72_0_1"}    | ${"empties the swimming pool"}
	${"3afdd8b6c3_0"}      | ${"when staying at the hotel"}
	${"3afdd8b6c3_1"}      | ${"makes a wish list"}
	${"-1730f876b4_0_4"}   | ${"and the fridge is out of apple juice"}
	${"-1730f876b4_7"}     | ${"selects a winner"}
	${"-e45b128829_4_4_3"} | ${"finds the treasure"}
	${"-e45b128829_4_4_6"} | ${"and the movie starts playing"}
`(
	"when an existing subtask with id $subtaskId is renamed to $newName",
	(props: {
		subtaskId: DummySuiteId | DummyTestId
		newName: string
	}) => {
		const subtaskId = props.subtaskId

		let actualProject: Project
		let actualSubtask: Subtask

		beforeEach(() => {
			const initialSubtask = getSubtaskById(initialProject, subtaskId)
			const updatedSubtask: Subtask = {
				...initialSubtask,
				name: props.newName,
			}

			actualProject = applyEvent(initialProject, subtaskUpdated(updatedSubtask))
			actualSubtask = getSubtaskById(actualProject, subtaskId)
		})

		it(`sets the subtask name to '${props.newName}'`, () => {
			expect(actualSubtask.name).toBe(props.newName)
		})

		it("does not affect the modules in the project", () => {
			const initialModules = initialProject.modulesById
			const actualModules = actualProject.modulesById

			expect(actualModules).toEqual(initialModules)
		})

		it("does not affect the other subtasks in the project", () => {
			const { [subtaskId]: initialUpdatedSubtask, ...initialOtherSubtasks } =
				initialProject.subtasksById

			const { [subtaskId]: actualUpdatedSubtask, ...actualOtherSubtasks } =
				actualProject.subtasksById

			expect(actualOtherSubtasks).toEqual(initialOtherSubtasks)
		})
	},
)

describe.each`
	subtaskId              | type       | name                                             | status
	${"15b021ef72_8"}      | ${"suite"} | ${"when the fridge is out of milk"}              | ${failed(6)}
	${"15b021ef72_2_4"}    | ${"suite"} | ${"and the computer needs charging"}             | ${passed(0)}
	${"-1730f876b4_0_5"}   | ${"test"}  | ${"solves the puzzle"}                           | ${skipped()}
	${"-1730f876b4_0_4_9"} | ${"test"}  | ${"climbs the highest mountain"}                 | ${started()}
	${"3afdd8b6c3_0_7"}    | ${"test"}  | ${"receives a long-lost package"}                | ${failed(19)}
	${"3afdd8b6c3_5"}      | ${"test"}  | ${"jumps over the lazy dog"}                     | ${passed(10)}
	${"-e45b128829_0"}     | ${"suite"} | ${"when ordering a large meal with extra fries"} | ${skipped()}
	${"-e45b128829_4_2"}   | ${"suite"} | ${"and the bus is late"}                         | ${started()}
`(
	"when a non-existing subtask with id $subtaskId has $status.type",
	(props: {
		subtaskId: DummySuiteId | DummyTestId
		type: "suite" | "test"
		name: string
		status: TaskStatus
	}) => {
		const subtaskId = props.subtaskId
		const [moduleId, parentSuiteId] = dummyParentIds(subtaskId)

		let actualProject: Project
		let actualSubtask: Subtask

		beforeEach(() => {
			const updatedSubtask: Subtask = {
				type: props.type,
				id: props.subtaskId,
				parentId: parentSuiteId ?? moduleId,
				parentModuleId: moduleId,
				name: props.name,
				status: props.status,
			}

			actualProject = applyEvent(initialProject, subtaskUpdated(updatedSubtask))
			actualSubtask = getSubtaskById(actualProject, subtaskId)
		})

		it(`sets the subtask status to '${props.status.type}'`, () => {
			expect(actualSubtask.status).toBe(props.status)
		})

		it(`sets the subtask name to '${props.name}'`, () => {
			expect(actualSubtask.name).toBe(props.name)
		})

		it("does not affect the modules in the project", () => {
			const initialModules = initialProject.modulesById
			const actualModules = actualProject.modulesById

			expect(actualModules).toEqual(initialModules)
		})

		it("adds the subtask to the project", () => {
			const initialSubtaskIds = Object.keys(initialProject.subtasksById)
			const actualSubtaskIds = Object.keys(actualProject.subtasksById)

			expect(actualSubtaskIds).toEqual([...initialSubtaskIds, subtaskId])
		})

		it("does not affect the other subtasks in the project", () => {
			const initialOtherSubtasks = initialProject.subtasksById

			const { [subtaskId]: actualNewSubtask, ...actualOtherSubtasks } =
				actualProject.subtasksById

			expect(actualOtherSubtasks).toEqual(initialOtherSubtasks)
		})
	},
)

describe.each`
	subtaskId              | type       | name                                             | status
	${"15b021ef72_0_2_6"}  | ${"suite"} | ${"when the fridge is out of milk"}              | ${failed(8)}
	${"3afdd8b6c3_2_4_0"}  | ${"suite"} | ${"and the computer needs charging"}             | ${passed(1)}
	${"-1730f876b4_5_1"}   | ${"test"}  | ${"solves the puzzle"}                           | ${skipped()}
	${"-e45b128829_4_2_1"} | ${"test"}  | ${"climbs the highest mountain"}                 | ${started()}
	${"134672b00e_1"}      | ${"test"}  | ${"receives a long-lost package"}                | ${failed(5)}
	${"29bb9e8bc0_0_1"}    | ${"test"}  | ${"jumps over the lazy dog"}                     | ${passed(14)}
	${"-20e94f4789_2"}     | ${"suite"} | ${"when ordering a large meal with extra fries"} | ${skipped()}
	${"6ab50b9861_0_4"}    | ${"suite"} | ${"and the bus is late"}                         | ${started()}
`(
	"when a non-existing subtask with id $subtaskId has $status.type in a non-existing parent",
	(props: {
		subtaskId: DummySuiteId | DummyTestId
		type: "suite" | "test"
		name: string
		status: TaskStatus
	}) => {
		const subtaskId = props.subtaskId
		const [moduleId, parentSuiteId] = dummyParentIds(subtaskId)

		let actualProject: Project

		beforeEach(() => {
			const updatedSubtask: Subtask = {
				type: props.type,
				id: props.subtaskId,
				parentId: parentSuiteId ?? moduleId,
				parentModuleId: moduleId,
				name: props.name,
				status: props.status,
			}

			actualProject = applyEvent(initialProject, subtaskUpdated(updatedSubtask))
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
