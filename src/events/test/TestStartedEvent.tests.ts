import { applyEvent } from "+events/Event"
import { testStartedEvent } from "+events/test/TestStartedEvent"
import {
	type File,
	assertFileChildCount,
	countFileChildren,
	getFileChildIds,
} from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	assertProjectFileCount,
	getFileById,
	getTestByPath,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { dummySuite } from "+models/Suite.fixtures"
import type { Test, TestStatus } from "+models/Test"
import {
	type DummyTestId,
	dummyTest,
	getPathFromDummyTestId,
} from "+models/Test.fixtures"
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
				dummySuite("a3fdd8b6c3_2_8_4", { status: "skipped" }, [
					dummyTest("a3fdd8b6c3_2_8_4_1", { status: "failed" }),
				]),
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
				dummySuite("-e45b128829_4_4_6", { status: "skipped" }, [
					dummyTest("-e45b128829_4_4_6_5", { status: "failed" }),
				]),
			]),
		]),
	]),
])

beforeAll(() => {
	assertProjectFileCount(initialProject, 4)
	assertFileChildCount(initialProject.files[0], 8)
	assertFileChildCount(initialProject.files[1], 17)
	assertFileChildCount(initialProject.files[2], 7)
	assertFileChildCount(initialProject.files[3], 7)
})

describe.each`
	testId                   | name                             | expectedChildIdOrder
	${"15b021ef72_57"}       | ${"asks for directions"}         | ${["15b021ef72_0", "15b021ef72_0_1", "15b021ef72_1", "15b021ef72_2", "15b021ef72_2_3", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_9", "15b021ef72_57"]}
	${"15b021ef72_0_3"}      | ${"finds the hidden door"}       | ${["15b021ef72_0", "15b021ef72_0_1", "15b021ef72_0_3", "15b021ef72_1", "15b021ef72_2", "15b021ef72_2_3", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_9"]}
	${"15b021ef72_2_1"}      | ${"navigates the labyrinth"}     | ${["15b021ef72_0", "15b021ef72_0_1", "15b021ef72_1", "15b021ef72_2", "15b021ef72_2_1", "15b021ef72_2_3", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_9"]}
	${"15b021ef72_2_6_13"}   | ${"explores the unknown"}        | ${["15b021ef72_0", "15b021ef72_0_1", "15b021ef72_1", "15b021ef72_2", "15b021ef72_2_3", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_9", "15b021ef72_2_6_13"]}
	${"a3fdd8b6c3_5"}        | ${"jumps over the lazy dog"}     | ${["a3fdd8b6c3_0", "a3fdd8b6c3_0_1", "a3fdd8b6c3_0_3", "a3fdd8b6c3_1", "a3fdd8b6c3_2", "a3fdd8b6c3_2_5", "a3fdd8b6c3_2_6", "a3fdd8b6c3_2_6_7", "a3fdd8b6c3_2_6_9", "a3fdd8b6c3_2_8", "a3fdd8b6c3_2_8_1", "a3fdd8b6c3_2_8_3", "a3fdd8b6c3_2_8_4", "a3fdd8b6c3_2_8_4_1", "a3fdd8b6c3_3", "a3fdd8b6c3_4", "a3fdd8b6c3_4_5", "a3fdd8b6c3_5"]}
	${"a3fdd8b6c3_0_7"}      | ${"climbs the highest mountain"} | ${["a3fdd8b6c3_0", "a3fdd8b6c3_0_1", "a3fdd8b6c3_0_3", "a3fdd8b6c3_0_7", "a3fdd8b6c3_1", "a3fdd8b6c3_2", "a3fdd8b6c3_2_5", "a3fdd8b6c3_2_6", "a3fdd8b6c3_2_6_7", "a3fdd8b6c3_2_6_9", "a3fdd8b6c3_2_8", "a3fdd8b6c3_2_8_1", "a3fdd8b6c3_2_8_3", "a3fdd8b6c3_2_8_4", "a3fdd8b6c3_2_8_4_1", "a3fdd8b6c3_3", "a3fdd8b6c3_4", "a3fdd8b6c3_4_5"]}
	${"a3fdd8b6c3_2_6_13"}   | ${"dives into the trench"}       | ${["a3fdd8b6c3_0", "a3fdd8b6c3_0_1", "a3fdd8b6c3_0_3", "a3fdd8b6c3_1", "a3fdd8b6c3_2", "a3fdd8b6c3_2_5", "a3fdd8b6c3_2_6", "a3fdd8b6c3_2_6_7", "a3fdd8b6c3_2_6_9", "a3fdd8b6c3_2_6_13", "a3fdd8b6c3_2_8", "a3fdd8b6c3_2_8_1", "a3fdd8b6c3_2_8_3", "a3fdd8b6c3_2_8_4", "a3fdd8b6c3_2_8_4_1", "a3fdd8b6c3_3", "a3fdd8b6c3_4", "a3fdd8b6c3_4_5"]}
	${"a3fdd8b6c3_2_8_4_3"}  | ${"solves the puzzle"}           | ${["a3fdd8b6c3_0", "a3fdd8b6c3_0_1", "a3fdd8b6c3_0_3", "a3fdd8b6c3_1", "a3fdd8b6c3_2", "a3fdd8b6c3_2_5", "a3fdd8b6c3_2_6", "a3fdd8b6c3_2_6_7", "a3fdd8b6c3_2_6_9", "a3fdd8b6c3_2_8", "a3fdd8b6c3_2_8_1", "a3fdd8b6c3_2_8_3", "a3fdd8b6c3_2_8_4", "a3fdd8b6c3_2_8_4_1", "a3fdd8b6c3_2_8_4_3", "a3fdd8b6c3_3", "a3fdd8b6c3_4", "a3fdd8b6c3_4_5"]}
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
	"when a new test with id $testId has started running",
	(props: {
		testId: DummyTestId
		name: string
		expectedChildIdOrder: Array<string>
	}) => {
		const path = getPathFromDummyTestId(props.testId)
		const [fileId] = path

		const initialFile = getFileById(initialProject, fileId)
		assertNotNullish(initialFile)

		let actualProject: Project
		let actualFile: File
		let actualTest: Test

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				testStartedEvent({ name: props.name, path }),
			)

			const file = getFileById(actualProject, fileId)
			assertNotNullish(file)
			actualFile = file

			const test = getTestByPath(actualProject, path)
			assertNotNullish(test)
			actualTest = test
		})

		it("sets the test status to 'running'", () => {
			expect(actualTest.status).toBe<TestStatus>("running")
		})

		it("clears the test duration", () => {
			expect(actualTest.duration).toBe(0)
		})

		it("adds the test to the file and sorts the suites and tests by their id", () => {
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
	testId                   | name
	${"15b021ef72_1"}        | ${"pours a cup of apple juice"}
	${"15b021ef72_2_3"}      | ${"changes the batteries"}
	${"15b021ef72_2_6_7"}    | ${"turns the ceiling lights on"}
	${"a3fdd8b6c3_3"}        | ${"recharges the smartphone"}
	${"a3fdd8b6c3_2_5"}      | ${"refills the basket with fresh bananas"}
	${"a3fdd8b6c3_2_6_7"}    | ${"turns the floor lamps on"}
	${"a3fdd8b6c3_2_8_4_1"}  | ${"pours a cup of banana smoothie"}
	${"-1730f876b4_7"}       | ${"turns the outdoor lights on"}
	${"-1730f876b4_9"}       | ${"moves one tile to the south"}
	${"-1730f876b4_0_1"}     | ${"pours a cup of orange juice"}
	${"-1730f876b4_0_3"}     | ${"plugs in the power cord"}
	${"-1730f876b4_0_4_5"}   | ${"refills the basket with fresh oranges"}
	${"-e45b128829_2_1"}     | ${"pours a cup of peach smoothie"}
	${"-e45b128829_4_4_3"}   | ${"amplifies the signal"}
	${"-e45b128829_4_4_6_5"} | ${"refills the basket with fresh peaches"}
`(
	"when an existing test with id $testId has started running",
	(props: {
		testId: DummyTestId
		name: string
	}) => {
		const path = getPathFromDummyTestId(props.testId)
		const [fileId] = path

		const initialFile = getFileById(initialProject, fileId)
		assertNotNullish(initialFile)

		let actualProject: Project
		let actualFile: File
		let actualTest: Test

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				testStartedEvent({ name: props.name, path }),
			)

			const file = getFileById(actualProject, fileId)
			assertNotNullish(file)
			actualFile = file

			const test = getTestByPath(actualProject, path)
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

describe.each`
	testId                | name
	${"15b021ef72_4_1"}   | ${"makes a cherry smoothie"}
	${"15b021ef72_2_4_1"} | ${"makes a grape smoothie"}
	${"f9bb9e8bc0_1"}     | ${"makes a pear smoothie"}
	${"f9bb9e8bc0_0_1"}   | ${"makes a strawberry smoothie"}
`(
	"when a test with id $testId in a non-existing parent has started running",
	(props: {
		testId: DummyTestId
		name: string
	}) => {
		const path = getPathFromDummyTestId(props.testId)

		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				testStartedEvent({ name: props.name, path }),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
