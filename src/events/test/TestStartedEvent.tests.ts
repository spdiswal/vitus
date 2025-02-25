import { applyEvent } from "+events/Event"
import { testStartedEvent } from "+events/test/TestStartedEvent"
import { type File, type FileStatus, getTopLevelTestById } from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import { type Project, getFileById } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { dummySuite } from "+models/Suite.fixtures"
import type { Test, TestIds, TestPath, TestStatus } from "+models/Test"
import { dummyTest } from "+models/Test.fixtures"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeEach, describe, expect, it } from "vitest"

describe("given a project of 4 files with a mix of tests", () => {
	const initialProject = dummyProject({
		files: [
			dummyFile("15b021ef72", {
				duration: 14,
				status: "failed",
				suites: [dummySuite("15b021ef72_10", { status: "skipped" })],
				tests: [
					dummyTest("15b021ef72_50", { status: "failed" }),
					dummyTest("15b021ef72_51", { status: "skipped" }),
				],
			}),
			dummyFile("a3fdd8b6c3", {
				duration: 6,
				status: "running",
				suites: [
					dummySuite("a3fdd8b6c3_11", { status: "passed" }),
					dummySuite("a3fdd8b6c3_12", { status: "skipped" }),
				],
				tests: [
					dummyTest("a3fdd8b6c3_51", { status: "passed" }),
					dummyTest("a3fdd8b6c3_52", { status: "failed" }),
				],
			}),
			dummyFile("-1730f876b4", {
				duration: 9,
				status: "passed",
				suites: [],
				tests: [dummyTest("-1730f876b4_51", { status: "failed" })],
			}),
			dummyFile("-e45b128829", {
				duration: 11,
				status: "skipped",
				suites: [
					dummySuite("-e45b128829_10", { status: "skipped" }),
					dummySuite("-e45b128829_11", { status: "passed" }),
					dummySuite("-e45b128829_12", { status: "failed" }),
				],
				tests: [dummyTest("-e45b128829_52", { status: "skipped" })],
			}),
		],
	})

	it("has 4 files with 2, 2, 1, and 1 tests initially", () => {
		expect(initialProject.files).toHaveLength(4)
		expect(initialProject.files[0].tests).toHaveLength(2)
		expect(initialProject.files[1].tests).toHaveLength(2)
		expect(initialProject.files[2].tests).toHaveLength(1)
		expect(initialProject.files[3].tests).toHaveLength(1)
	})

	describe.each`
		path                                  | name                           | expectedFileDuration | expectedFileStatus | expectedSuiteCount | expectedTestCount | expectedTestIds
		${["15b021ef72", "15b021ef72_57"]}    | ${"asks for directions"}       | ${14}                | ${"failed"}        | ${1}               | ${3}              | ${["15b021ef72_50", "15b021ef72_51", "15b021ef72_57"]}
		${["a3fdd8b6c3", "a3fdd8b6c3_50"]}    | ${"jumps over the lazy dog"}   | ${6}                 | ${"running"}       | ${2}               | ${3}              | ${["a3fdd8b6c3_50", "a3fdd8b6c3_51", "a3fdd8b6c3_52"]}
		${["-1730f876b4", "-1730f876b4_50"]}  | ${"empties the swimming pool"} | ${9}                 | ${"passed"}        | ${0}               | ${2}              | ${["-1730f876b4_50", "-1730f876b4_51"]}
		${["-1730f876b4", "-1730f876b4_53"]}  | ${"makes a wish list"}         | ${9}                 | ${"passed"}        | ${0}               | ${2}              | ${["-1730f876b4_51", "-1730f876b4_53"]}
		${["-e45b128829", "-e45b128829_49"]}  | ${"selects a winner"}          | ${11}                | ${"skipped"}       | ${3}               | ${2}              | ${["-e45b128829_49", "-e45b128829_52"]}
		${["-e45b128829", "-e45b128829_510"]} | ${"completes the purchase"}    | ${11}                | ${"skipped"}       | ${3}               | ${2}              | ${["-e45b128829_52", "-e45b128829_510"]}
	`(
		"when a new top-level test with id $path.1 has started running",
		(props: {
			path: TestPath
			name: string
			expectedFileDuration: Duration
			expectedFileStatus: FileStatus
			expectedSuiteCount: number
			expectedTestCount: number
			expectedTestIds: TestIds
		}) => {
			let actualProject: Project
			let actualFile: File
			let actualTest: Test

			const [fileId, testId] = props.path

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
				expect(actualFile.tests).toHaveLength(props.expectedTestCount)
				expect(actualFile.tests).toContainEqual(actualTest)
			})

			it("sorts the tests by their id", () => {
				expect(actualFile.tests.map((test) => test.id)).toEqual(
					props.expectedTestIds,
				)
			})

			it("does not affect the number of suites in the file", () => {
				expect(actualFile.suites).toHaveLength(props.expectedSuiteCount)
			})

			it("does not affect the file duration", () => {
				expect(actualFile.duration).toBe(props.expectedFileDuration)
			})

			it("does not affect the file status", () => {
				expect(actualFile.status).toBe(props.expectedFileStatus)
			})
		},
	)

	describe.each`
		path                                 | name                                   | expectedFileDuration | expectedFileStatus | expectedSuiteCount | expectedTestCount
		${["15b021ef72", "15b021ef72_50"]}   | ${"refills the basket with 0 apples"}  | ${14}                | ${"failed"}        | ${1}               | ${2}
		${["15b021ef72", "15b021ef72_51"]}   | ${"refills the basket with 1 apple"}   | ${14}                | ${"failed"}        | ${1}               | ${2}
		${["a3fdd8b6c3", "a3fdd8b6c3_51"]}   | ${"refills the basket with 1 banana"}  | ${6}                 | ${"running"}       | ${2}               | ${2}
		${["a3fdd8b6c3", "a3fdd8b6c3_52"]}   | ${"refills the basket with 2 bananas"} | ${6}                 | ${"running"}       | ${2}               | ${2}
		${["-1730f876b4", "-1730f876b4_51"]} | ${"refills the basket with 1 orange"}  | ${9}                 | ${"passed"}        | ${0}               | ${1}
		${["-e45b128829", "-e45b128829_52"]} | ${"refills the basket with 2 peaches"} | ${11}                | ${"skipped"}       | ${3}               | ${1}
	`(
		"when an existing test with id $path.1 has started running",
		(props: {
			path: TestPath
			name: string
			expectedFileDuration: Duration
			expectedFileStatus: FileStatus
			expectedSuiteCount: number
			expectedTestCount: number
		}) => {
			let actualProject: Project
			let actualFile: File
			let actualTest: Test

			const [fileId, testId] = props.path

			// biome-ignore lint/suspicious/noDuplicateTestHooks: This is a false positive.
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

			it("preserves the suites in the file", () => {
				expect(actualFile.suites).toHaveLength(props.expectedSuiteCount)
			})

			it("preserves the tests in the file", () => {
				expect(actualFile.tests).toHaveLength(props.expectedTestCount)
			})

			it("does not affect the file duration", () => {
				expect(actualFile.duration).toBe(props.expectedFileDuration)
			})

			it("does not affect the file status", () => {
				expect(actualFile.status).toBe(props.expectedFileStatus)
			})
		},
	)
})
