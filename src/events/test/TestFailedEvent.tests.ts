import { applyEvent } from "+events/Event"
import { testFailedEvent } from "+events/test/TestFailedEvent"
import {
	type File,
	assertFileChildCount,
	countFileChildren,
} from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	assertProjectFileCount,
	getFileById,
	getOtherFiles,
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
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyFile("15b021ef72", {}, [
		dummySuite("15b021ef72_0", { status: "passed" }, [
			dummyTest("15b021ef72_0_1", { status: "passed" }),
		]),
		dummyTest("15b021ef72_1", { status: "passed" }),
		dummySuite("15b021ef72_2", { status: "skipped" }, [
			dummyTest("15b021ef72_2_3", { status: "passed" }),
			dummySuite("15b021ef72_2_6", { status: "skipped" }, [
				dummyTest("15b021ef72_2_6_7", { status: "passed" }),
				dummyTest("15b021ef72_2_6_9", { status: "passed" }),
			]),
		]),
	]),
	dummyFile("a3fdd8b6c3", {}, [
		dummySuite("a3fdd8b6c3_0", { status: "passed" }, [
			dummyTest("a3fdd8b6c3_0_1", { status: "passed" }),
			dummyTest("a3fdd8b6c3_0_3", { status: "passed" }),
		]),
		dummyTest("a3fdd8b6c3_1", { status: "passed" }),
		dummySuite("a3fdd8b6c3_2", { status: "skipped" }, [
			dummyTest("a3fdd8b6c3_2_5", { status: "passed" }),
			dummySuite("a3fdd8b6c3_2_6", { status: "skipped" }, [
				dummyTest("a3fdd8b6c3_2_6_7", { status: "passed" }),
				dummyTest("a3fdd8b6c3_2_6_9", { status: "passed" }),
			]),
			dummySuite("a3fdd8b6c3_2_8", { status: "skipped" }, [
				dummyTest("a3fdd8b6c3_2_8_1", { status: "passed" }),
				dummyTest("a3fdd8b6c3_2_8_3", { status: "passed" }),
				dummySuite("a3fdd8b6c3_2_8_4", { status: "passed" }, [
					dummyTest("a3fdd8b6c3_2_8_4_1", { status: "skipped" }),
				]),
			]),
		]),
		dummyTest("a3fdd8b6c3_3", { status: "skipped" }),
		dummySuite("a3fdd8b6c3_4", { status: "skipped" }, [
			dummyTest("a3fdd8b6c3_4_5", { status: "skipped" }),
		]),
	]),
	dummyFile("-1730f876b4", {}, [
		dummySuite("-1730f876b4_0", { status: "passed" }, [
			dummyTest("-1730f876b4_0_1", { status: "skipped" }),
			dummyTest("-1730f876b4_0_3", { status: "skipped" }),
			dummySuite("-1730f876b4_0_4", { status: "passed" }, [
				dummyTest("-1730f876b4_0_4_5", { status: "skipped" }),
			]),
		]),
		dummyTest("-1730f876b4_7", { status: "skipped" }),
		dummyTest("-1730f876b4_9", { status: "skipped" }),
	]),
	dummyFile("-e45b128829", {}, [
		dummySuite("-e45b128829_2", { status: "passed" }, [
			dummyTest("-e45b128829_2_1", { status: "skipped" }),
		]),
		dummySuite("-e45b128829_4", { status: "passed" }, [
			dummySuite("-e45b128829_4_4", { status: "passed" }, [
				dummyTest("-e45b128829_4_4_3", { status: "skipped" }),
				dummySuite("-e45b128829_4_4_6", { status: "passed" }, [
					dummyTest("-e45b128829_4_4_6_5", { status: "passed" }),
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
	testId                   | duration
	${"15b021ef72_1"}        | ${7}
	${"15b021ef72_0_1"}      | ${9}
	${"15b021ef72_2_6_9"}    | ${13}
	${"a3fdd8b6c3_1"}        | ${11}
	${"a3fdd8b6c3_3"}        | ${6}
	${"a3fdd8b6c3_0_3"}      | ${15}
	${"a3fdd8b6c3_2_6_7"}    | ${8}
	${"a3fdd8b6c3_2_8_4_1"}  | ${1}
	${"-1730f876b4_7"}       | ${14}
	${"-1730f876b4_9"}       | ${5}
	${"-1730f876b4_0_1"}     | ${12}
	${"-1730f876b4_0_4_5"}   | ${3}
	${"-e45b128829_2_1"}     | ${4}
	${"-e45b128829_4_4_3"}   | ${10}
	${"-e45b128829_4_4_6_5"} | ${2}
`(
	"when a test with id $testId has failed",
	(props: {
		testId: DummyTestId
		duration: Duration
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
				testFailedEvent({ path, duration: props.duration }),
			)

			const file = getFileById(actualProject, fileId)
			assertNotNullish(file)
			actualFile = file

			const test = getTestByPath(actualProject, path)
			assertNotNullish(test)
			actualTest = test
		})

		it("sets the test status to 'failed'", () => {
			expect(actualTest.status).toBe<TestStatus>("failed")
		})

		it("updates the test duration", () => {
			expect(actualTest.duration).toBe(props.duration)
		})

		it("does not affect the number of suites and tests in the file", () => {
			expect(countFileChildren(actualFile)).toBe(countFileChildren(initialFile))
		})

		// TODO: updates the suite duration based on its tests

		it("does not affect the other files in the project", () => {
			expect(getOtherFiles(actualProject, fileId)).toEqual(
				getOtherFiles(initialProject, fileId),
			)
		})
	},
)

describe.each`
	testId                 | duration
	${"-1730f876b4_0_5"}   | ${2}
	${"-1730f876b4_0_4_9"} | ${11}
	${"f9bb9e8bc0_1"}      | ${6}
	${"f9bb9e8bc0_0_1"}    | ${5}
`(
	"when a non-existing test with id $testId has failed",
	(props: {
		testId: DummyTestId
		duration: Duration
	}) => {
		const path = getPathFromDummyTestId(props.testId)

		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				testFailedEvent({ path, duration: props.duration }),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
