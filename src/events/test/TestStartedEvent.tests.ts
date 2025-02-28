import { applyEvent } from "+events/Event"
import { testStartedEvent } from "+events/test/TestStartedEvent"
import {
	type File,
	assertFileChildCount,
	countFileChildren,
	getFileChildIds,
	getTopLevelTestById,
} from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	assertProjectFileCount,
	getFileById,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { dummySuite } from "+models/Suite.fixtures"
import type { Test, TestPath, TestStatus } from "+models/Test"
import { dummyTest } from "+models/Test.fixtures"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyFile("15b021ef72", { duration: 14, status: "failed" }, [
		dummySuite("15b021ef72_0", { status: "failed" }, [
			dummyTest("15b021ef72_0_1", { status: "failed" }),
		]),
		dummyTest("15b021ef72_1", { status: "passed" }),
		dummySuite("15b021ef72_2", { status: "passed" }, [
			dummyTest("15b021ef72_2_3", { status: "skipped" }),
			dummySuite("15b021ef72_2_6", { status: "passed" }, [
				dummyTest("15b021ef72_2_6_7", { status: "passed" }),
				dummyTest("15b021ef72_2_6_9", { status: "skipped" }),
			]),
		]),
	]),
	dummyFile("a3fdd8b6c3", { duration: 6, status: "running" }, [
		dummySuite("a3fdd8b6c3_0", { status: "failed" }, [
			dummyTest("a3fdd8b6c3_0_1", { status: "passed" }),
			dummyTest("a3fdd8b6c3_0_3", { status: "failed" }),
		]),
		dummyTest("a3fdd8b6c3_1", { status: "skipped" }),
		dummySuite("a3fdd8b6c3_2", { status: "skipped" }, [
			dummyTest("a3fdd8b6c3_2_5", { status: "failed" }),
			dummySuite("a3fdd8b6c3_2_6", { status: "failed" }, [
				dummyTest("a3fdd8b6c3_2_6_7", { status: "passed" }),
				dummyTest("a3fdd8b6c3_2_6_9", { status: "passed" }),
			]),
			dummySuite("a3fdd8b6c3_2_8", { status: "passed" }, [
				dummyTest("a3fdd8b6c3_2_8_1", { status: "passed" }),
				dummyTest("a3fdd8b6c3_2_8_3", { status: "skipped" }),
			]),
		]),
		dummyTest("a3fdd8b6c3_3", { status: "failed" }),
		dummySuite("a3fdd8b6c3_4", { status: "skipped" }, [
			dummyTest("a3fdd8b6c3_4_5", { status: "skipped" }),
		]),
	]),
	dummyFile("-1730f876b4", { duration: 9, status: "passed" }, [
		dummySuite("-1730f876b4_0", { status: "passed" }, [
			dummyTest("-1730f876b4_0_1", { status: "failed" }),
			dummyTest("-1730f876b4_0_3", { status: "skipped" }),
			dummySuite("-1730f876b4_0_4", { status: "passed" }, [
				dummyTest("-1730f876b4_0_4_5", { status: "skipped" }),
			]),
		]),
		dummyTest("-1730f876b4_7", { status: "skipped" }),
		dummyTest("-1730f876b4_9", { status: "failed" }),
	]),
	dummyFile("-e45b128829", { duration: 11, status: "skipped" }, [
		dummySuite("-e45b128829_2", { status: "failed" }, [
			dummyTest("-e45b128829_2_1", { status: "failed" }),
		]),
		dummySuite("-e45b128829_4", { status: "passed" }, [
			dummySuite("-e45b128829_4_4", { status: "passed" }, [
				dummyTest("-e45b128829_4_4_3", { status: "passed" }),
			]),
		]),
	]),
])

beforeAll(() => {
	assertProjectFileCount(initialProject, 4)
	assertFileChildCount(initialProject.files[0], 8)
	assertFileChildCount(initialProject.files[1], 15)
	assertFileChildCount(initialProject.files[2], 7)
	assertFileChildCount(initialProject.files[3], 5)
})

describe.each`
	path                                 | name                           | expectedChildIdOrder
	${["15b021ef72", "15b021ef72_57"]}   | ${"asks for directions"}       | ${["15b021ef72_0", "15b021ef72_0_1", "15b021ef72_1", "15b021ef72_2", "15b021ef72_2_3", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_9", "15b021ef72_57"]}
	${["a3fdd8b6c3", "a3fdd8b6c3_5"]}    | ${"jumps over the lazy dog"}   | ${["a3fdd8b6c3_0", "a3fdd8b6c3_0_1", "a3fdd8b6c3_0_3", "a3fdd8b6c3_1", "a3fdd8b6c3_2", "a3fdd8b6c3_2_5", "a3fdd8b6c3_2_6", "a3fdd8b6c3_2_6_7", "a3fdd8b6c3_2_6_9", "a3fdd8b6c3_2_8", "a3fdd8b6c3_2_8_1", "a3fdd8b6c3_2_8_3", "a3fdd8b6c3_3", "a3fdd8b6c3_4", "a3fdd8b6c3_4_5", "a3fdd8b6c3_5"]}
	${["-1730f876b4", "-1730f876b4_1"]}  | ${"empties the swimming pool"} | ${["-1730f876b4_0", "-1730f876b4_0_1", "-1730f876b4_0_3", "-1730f876b4_0_4", "-1730f876b4_0_4_5", "-1730f876b4_1", "-1730f876b4_7", "-1730f876b4_9"]}
	${["-1730f876b4", "-1730f876b4_53"]} | ${"makes a wish list"}         | ${["-1730f876b4_0", "-1730f876b4_0_1", "-1730f876b4_0_3", "-1730f876b4_0_4", "-1730f876b4_0_4_5", "-1730f876b4_7", "-1730f876b4_9", "-1730f876b4_53"]}
	${["-e45b128829", "-e45b128829_1"]}  | ${"selects a winner"}          | ${["-e45b128829_1", "-e45b128829_2", "-e45b128829_2_1", "-e45b128829_4", "-e45b128829_4_4", "-e45b128829_4_4_3"]}
	${["-e45b128829", "-e45b128829_11"]} | ${"completes the purchase"}    | ${["-e45b128829_2", "-e45b128829_2_1", "-e45b128829_4", "-e45b128829_4_4", "-e45b128829_4_4_3", "-e45b128829_11"]}
`(
	"when a new top-level test with id $path.1 has started running",
	(props: {
		path: TestPath
		name: string
		expectedChildIdOrder: Array<string>
	}) => {
		const [fileId, testId] = props.path

		const initialFile = getFileById(initialProject, fileId)
		assertNotNullish(initialFile)

		let actualProject: Project
		let actualFile: File
		let actualTest: Test

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				testStartedEvent({ name: props.name, path: props.path }),
			)

			const file = getFileById(actualProject, fileId)
			assertNotNullish(file)

			actualFile = file

			const test = getTopLevelTestById(file, testId)
			assertNotNullish(test)

			actualTest = test
		})

		it("sets the test status to 'running'", () => {
			expect(actualTest.status).toBe<TestStatus>("running")
		})

		it("clears the test duration", () => {
			expect(actualTest.duration).toBe(0)
		})

		it("adds the test to the file", () => {
			expect(actualFile.children).toHaveLength(initialFile.children.length + 1)
			expect(actualFile.children).toContainEqual(actualTest)
		})

		it("sorts the suites and tests by their id", () => {
			expect(getFileChildIds(actualFile)).toEqual(props.expectedChildIdOrder)
		})

		// TODO: updates the suite duration based on its tests

		it("does not affect the file duration", () => {
			expect(actualFile.duration).toBe(initialFile.duration)
		})

		it("does not affect the file status", () => {
			expect(actualFile.status).toBe(initialFile.status)
		})
	},
)

describe.each`
	path                                | name
	${["15b021ef72", "15b021ef72_1"]}   | ${"pours a cup of apple juice"}
	${["a3fdd8b6c3", "a3fdd8b6c3_1"]}   | ${"pours a cup of banana smoothie"}
	${["a3fdd8b6c3", "a3fdd8b6c3_3"]}   | ${"recharges the smartphone"}
	${["-1730f876b4", "-1730f876b4_7"]} | ${"turns the outdoor lights on"}
	${["-1730f876b4", "-1730f876b4_9"]} | ${"moves one tile to the south"}
`(
	"when an existing top-level test with id $path.1 has started running",
	(props: {
		path: TestPath
		name: string
	}) => {
		const [fileId, testId] = props.path

		const initialFile = getFileById(initialProject, fileId)
		assertNotNullish(initialFile)

		let actualProject: Project
		let actualFile: File
		let actualTest: Test

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				testStartedEvent({ name: props.name, path: props.path }),
			)

			const file = getFileById(actualProject, fileId)
			assertNotNullish(file)

			actualFile = file

			const test = getTopLevelTestById(file, testId)
			assertNotNullish(test)

			actualTest = test
		})

		it("sets the test status to 'running'", () => {
			expect(actualTest.status).toBe<TestStatus>("running")
		})

		it("clears the test duration", () => {
			expect(actualTest.duration).toBe(0)
		})

		it("does not affect the number of suites and tests in the file", () => {
			expect(countFileChildren(actualFile)).toBe(countFileChildren(initialFile))
		})

		// TODO: updates the suite duration based on its tests

		it("does not affect the file duration", () => {
			expect(actualFile.duration).toBe(initialFile.duration)
		})

		it("does not affect the file status", () => {
			expect(actualFile.status).toBe(initialFile.status)
		})
	},
)

// TODO: when a new nested test has started running
// TODO: when an existing nested test has started running
