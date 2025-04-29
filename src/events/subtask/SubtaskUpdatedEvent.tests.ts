import { applyProjectEvent } from "+events/ProjectEvent"
import { subtaskUpdatedEvent } from "+events/subtask/SubtaskUpdatedEvent"
import { dummyParentIds } from "+models/Module.fixtures"
import type { Project } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { type Subtask, getSubtaskById } from "+models/Subtask"
import type { DummySuiteId } from "+models/Suite.fixtures"
import type { TaskStatus } from "+models/TaskStatus"
import type { DummyTestId } from "+models/Test.fixtures"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject()

describe.each`
	subtaskId                | newStatus
	${"15b021ef72_0"}        | ${"failed"}
	${"15b021ef72_0_1"}      | ${"passed"}
	${"15b021ef72_1"}        | ${"skipped"}
	${"15b021ef72_2"}        | ${"started"}
	${"15b021ef72_2_6"}      | ${"failed"}
	${"15b021ef72_2_6_9"}    | ${"passed"}
	${"3afdd8b6c3_0"}        | ${"skipped"}
	${"3afdd8b6c3_0_3"}      | ${"started"}
	${"3afdd8b6c3_1"}        | ${"failed"}
	${"3afdd8b6c3_3"}        | ${"passed"}
	${"3afdd8b6c3_2_6"}      | ${"skipped"}
	${"3afdd8b6c3_2_6_7"}    | ${"started"}
	${"3afdd8b6c3_2_8"}      | ${"failed"}
	${"3afdd8b6c3_2_8_4"}    | ${"passed"}
	${"3afdd8b6c3_2_8_4_1"}  | ${"skipped"}
	${"3afdd8b6c3_4"}        | ${"started"}
	${"-1730f876b4_0"}       | ${"failed"}
	${"-1730f876b4_0_1"}     | ${"passed"}
	${"-1730f876b4_0_4"}     | ${"skipped"}
	${"-1730f876b4_0_4_5"}   | ${"started"}
	${"-1730f876b4_7"}       | ${"failed"}
	${"-1730f876b4_9"}       | ${"passed"}
	${"-e45b128829_2"}       | ${"skipped"}
	${"-e45b128829_2_1"}     | ${"started"}
	${"-e45b128829_4_4"}     | ${"failed"}
	${"-e45b128829_4_4_3"}   | ${"passed"}
	${"-e45b128829_4_4_6"}   | ${"skipped"}
	${"-e45b128829_4_4_6_5"} | ${"started"}
`(
	"when an existing subtask with id $subtaskId has $newStatus",
	(props: {
		subtaskId: DummySuiteId | DummyTestId
		newStatus: TaskStatus
	}) => {
		const subtaskId = props.subtaskId

		let actualProject: Project
		let actualSubtask: Subtask

		beforeEach(() => {
			const initialSubtask = getSubtaskById(initialProject, subtaskId)
			const updatedSubtask: Subtask = {
				...initialSubtask,
				status: props.newStatus,
			}

			actualProject = applyProjectEvent(
				initialProject,
				subtaskUpdatedEvent(updatedSubtask),
			)
			actualSubtask = getSubtaskById(actualProject, subtaskId)
		})

		it(`sets the subtask status to '${props.newStatus}'`, () => {
			expect(actualSubtask.status).toBe(props.newStatus)
		})

		it("does not affect the set of subtasks in the project", () => {
			const initialSubtaskIds = Object.keys(initialProject.subtasksById)
			const actualSubtaskIds = Object.keys(actualProject.subtasksById)

			expect(actualSubtaskIds).toEqual(initialSubtaskIds)
		})

		it("does not affect the other subtasks in the project", () => {
			const { [subtaskId]: initialUpdatedSubtask, ...initialOtherSubtasks } =
				initialProject.subtasksById

			const { [subtaskId]: actualUpdatedSubtask, ...actualOtherSubtasks } =
				actualProject.subtasksById

			expect(actualOtherSubtasks).toEqual(initialOtherSubtasks)
		})

		it("does not affect the modules in the project", () => {
			const initialModules = initialProject.modulesById
			const actualModules = actualProject.modulesById

			expect(actualModules).toEqual(initialModules)
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

			actualProject = applyProjectEvent(
				initialProject,
				subtaskUpdatedEvent(updatedSubtask),
			)
			actualSubtask = getSubtaskById(actualProject, subtaskId)
		})

		it(`sets the subtask name to '${props.newName}'`, () => {
			expect(actualSubtask.name).toBe(props.newName)
		})

		it("does not affect the set of subtasks in the project", () => {
			const initialSubtaskIds = Object.keys(initialProject.subtasksById)
			const actualSubtaskIds = Object.keys(actualProject.subtasksById)

			expect(actualSubtaskIds).toEqual(initialSubtaskIds)
		})

		it("does not affect the other subtasks in the project", () => {
			const { [subtaskId]: initialUpdatedSubtask, ...initialOtherSubtasks } =
				initialProject.subtasksById

			const { [subtaskId]: actualUpdatedSubtask, ...actualOtherSubtasks } =
				actualProject.subtasksById

			expect(actualOtherSubtasks).toEqual(initialOtherSubtasks)
		})

		it("does not affect the modules in the project", () => {
			const initialModules = initialProject.modulesById
			const actualModules = actualProject.modulesById

			expect(actualModules).toEqual(initialModules)
		})
	},
)

describe.each`
	subtaskId              | type       | name                                             | newStatus
	${"15b021ef72_8"}      | ${"suite"} | ${"when the fridge is out of milk"}              | ${"failed"}
	${"15b021ef72_2_4"}    | ${"suite"} | ${"and the computer needs charging"}             | ${"passed"}
	${"-1730f876b4_0_5"}   | ${"test"}  | ${"solves the puzzle"}                           | ${"skipped"}
	${"-1730f876b4_0_4_9"} | ${"test"}  | ${"climbs the highest mountain"}                 | ${"started"}
	${"3afdd8b6c3_0_7"}    | ${"test"}  | ${"receives a long-lost package"}                | ${"failed"}
	${"3afdd8b6c3_5"}      | ${"test"}  | ${"jumps over the lazy dog"}                     | ${"passed"}
	${"-e45b128829_0"}     | ${"suite"} | ${"when ordering a large meal with extra fries"} | ${"skipped"}
	${"-e45b128829_4_2"}   | ${"suite"} | ${"and the bus is late"}                         | ${"started"}
`(
	"when a non-existing subtask with id $subtaskId has $newStatus",
	(props: {
		subtaskId: DummySuiteId | DummyTestId
		type: "suite" | "test"
		name: string
		newStatus: TaskStatus
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
				status: props.newStatus,
			}

			actualProject = applyProjectEvent(
				initialProject,
				subtaskUpdatedEvent(updatedSubtask),
			)
			actualSubtask = getSubtaskById(actualProject, subtaskId)
		})

		it(`sets the subtask status to '${props.newStatus}'`, () => {
			expect(actualSubtask.status).toBe(props.newStatus)
		})

		it(`sets the subtask name to '${props.name}'`, () => {
			expect(actualSubtask.name).toBe(props.name)
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

		it("does not affect the modules in the project", () => {
			const initialModules = initialProject.modulesById
			const actualModules = actualProject.modulesById

			expect(actualModules).toEqual(initialModules)
		})
	},
)

describe.each`
	subtaskId              | type       | name                                             | newStatus
	${"15b021ef72_0_2_6"}  | ${"suite"} | ${"when the fridge is out of milk"}              | ${"failed"}
	${"3afdd8b6c3_2_4_0"}  | ${"suite"} | ${"and the computer needs charging"}             | ${"passed"}
	${"-1730f876b4_5_1"}   | ${"test"}  | ${"solves the puzzle"}                           | ${"skipped"}
	${"-e45b128829_4_2_1"} | ${"test"}  | ${"climbs the highest mountain"}                 | ${"started"}
	${"134672b00e_1"}      | ${"test"}  | ${"receives a long-lost package"}                | ${"failed"}
	${"29bb9e8bc0_0_1"}    | ${"test"}  | ${"jumps over the lazy dog"}                     | ${"passed"}
	${"-20e94f4789_2"}     | ${"suite"} | ${"when ordering a large meal with extra fries"} | ${"skipped"}
	${"6ab50b9861_0_4"}    | ${"suite"} | ${"and the bus is late"}                         | ${"started"}
`(
	"when a non-existing subtask with id $subtaskId has $newStatus in a non-existing parent",
	(props: {
		subtaskId: DummySuiteId | DummyTestId
		type: "suite" | "test"
		name: string
		newStatus: TaskStatus
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
				status: props.newStatus,
			}

			actualProject = applyProjectEvent(
				initialProject,
				subtaskUpdatedEvent(updatedSubtask),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
