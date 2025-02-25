import { applyEvent } from "+events/Event"
import { suiteStartedEvent } from "+events/suite/SuiteStartedEvent"
import { type File, type FileStatus, getTopLevelSuiteById } from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import { type Project, getFileById } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Suite, SuitePath, SuiteStatus } from "+models/Suite"
import { dummySuite } from "+models/Suite.fixtures"
import type { TestIds } from "+models/Test"
import { dummyTest } from "+models/Test.fixtures"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeEach, describe, expect, it } from "vitest"

describe("given a project of 4 files with a mix of suites", () => {
	const initialProject = dummyProject({
		files: [
			dummyFile("15b021ef72", {
				duration: 14,
				status: "failed",
				suites: [
					dummySuite("15b021ef72_10", { status: "failed" }),
					dummySuite("15b021ef72_11", { status: "skipped" }),
				],
				tests: [
					dummyTest("15b021ef72_50", { status: "failed" }),
					dummyTest("15b021ef72_51", { status: "passed" }),
				],
			}),
			dummyFile("a3fdd8b6c3", {
				duration: 6,
				status: "running",
				suites: [
					dummySuite("a3fdd8b6c3_11", { status: "passed" }),
					dummySuite("a3fdd8b6c3_12", { status: "failed" }),
				],
				tests: [dummyTest("a3fdd8b6c3_50", { status: "passed" })],
			}),
			dummyFile("-1730f876b4", {
				duration: 9,
				status: "passed",
				suites: [dummySuite("-1730f876b4_11", { status: "failed" })],
				tests: [
					dummyTest("-1730f876b4_50", { status: "failed" }),
					dummyTest("-1730f876b4_51", { status: "skipped" }),
					dummyTest("-1730f876b4_52", { status: "skipped" }),
				],
			}),
			dummyFile("-e45b128829", {
				duration: 11,
				status: "skipped",
				suites: [dummySuite("-e45b128829_12", { status: "skipped" })],
				tests: [
					dummyTest("-e45b128829_50", { status: "passed" }),
					dummyTest("-e45b128829_51", { status: "passed" }),
				],
			}),
		],
	})

	it("has 4 files with 2, 2, 1, and 1 suites initially", () => {
		expect(initialProject.files).toHaveLength(4)
		expect(initialProject.files[0].suites).toHaveLength(2)
		expect(initialProject.files[1].suites).toHaveLength(2)
		expect(initialProject.files[2].suites).toHaveLength(1)
		expect(initialProject.files[3].suites).toHaveLength(1)
	})

	describe.each`
		path                                  | name                                             | expectedFileDuration | expectedFileStatus | expectedSuiteCount | expectedSuiteIds                                       | expectedTestCount
		${["15b021ef72", "15b021ef72_17"]}    | ${"when the computer needs charging"}            | ${14}                | ${"failed"}        | ${3}               | ${["15b021ef72_10", "15b021ef72_11", "15b021ef72_17"]} | ${2}
		${["a3fdd8b6c3", "a3fdd8b6c3_10"]}    | ${"when the fridge is out of soft drinks"}       | ${6}                 | ${"running"}       | ${3}               | ${["a3fdd8b6c3_10", "a3fdd8b6c3_11", "a3fdd8b6c3_12"]} | ${1}
		${["-1730f876b4", "-1730f876b4_10"]}  | ${"when travelling through time"}                | ${9}                 | ${"passed"}        | ${2}               | ${["-1730f876b4_10", "-1730f876b4_11"]}                | ${3}
		${["-1730f876b4", "-1730f876b4_13"]}  | ${"when the keyboard backlight is on"}           | ${9}                 | ${"passed"}        | ${2}               | ${["-1730f876b4_11", "-1730f876b4_13"]}                | ${3}
		${["-e45b128829", "-e45b128829_9"]}   | ${"when the bus is late"}                        | ${11}                | ${"skipped"}       | ${2}               | ${["-e45b128829_9", "-e45b128829_12"]}                 | ${2}
		${["-e45b128829", "-e45b128829_110"]} | ${"when ordering a large meal with extra fries"} | ${11}                | ${"skipped"}       | ${2}               | ${["-e45b128829_12", "-e45b128829_110"]}               | ${2}
	`(
		"when a new top-level suite with id $path.1 has started running",
		(props: {
			path: SuitePath
			name: string
			expectedFileDuration: Duration
			expectedFileStatus: FileStatus
			expectedSuiteCount: number
			expectedSuiteIds: TestIds
			expectedTestCount: number
		}) => {
			let actualProject: Project
			let actualFile: File
			let actualSuite: Suite

			const [fileId, suiteId] = props.path

			beforeEach(() => {
				actualProject = applyEvent(
					initialProject,
					suiteStartedEvent({ name: props.name, path: props.path }),
				)

				const file = getFileById(actualProject, fileId)
				assertNotNullish(file)

				actualFile = file

				const suite = getTopLevelSuiteById(file, suiteId)
				assertNotNullish(suite)

				actualSuite = suite
			})

			it("sets the suite status to 'running'", () => {
				expect(actualSuite.status).toBe<SuiteStatus>("running")
			})

			it("adds the suite to the file", () => {
				expect(actualFile.suites).toHaveLength(props.expectedSuiteCount)
				expect(actualFile.suites).toContainEqual(actualSuite)
			})

			it("sorts the suites by their id", () => {
				expect(actualFile.suites.map((suite) => suite.id)).toEqual(
					props.expectedSuiteIds,
				)
			})

			it("does not affect the number of tests in the file", () => {
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

	describe.each`
		path                                 | name                                     | expectedFileDuration | expectedFileStatus | expectedSuiteCount | expectedTestCount
		${["15b021ef72", "15b021ef72_10"]}   | ${"when the fruit basket has no apples"} | ${14}                | ${"failed"}        | ${2}               | ${2}
		${["15b021ef72", "15b021ef72_11"]}   | ${"when the spring break is over"}       | ${14}                | ${"failed"}        | ${2}               | ${2}
		${["a3fdd8b6c3", "a3fdd8b6c3_11"]}   | ${"when the summer break is over"}       | ${6}                 | ${"running"}       | ${2}               | ${1}
		${["a3fdd8b6c3", "a3fdd8b6c3_12"]}   | ${"when the music stops playing"}        | ${6}                 | ${"running"}       | ${2}               | ${1}
		${["-1730f876b4", "-1730f876b4_11"]} | ${"when the autumn break is over"}       | ${9}                 | ${"passed"}        | ${1}               | ${3}
		${["-e45b128829", "-e45b128829_12"]} | ${"when the movie stops playing"}        | ${11}                | ${"skipped"}       | ${1}               | ${2}
	`(
		"when an existing suite with id $path.1 has started running",
		(props: {
			path: SuitePath
			name: string
			expectedFileDuration: Duration
			expectedFileStatus: FileStatus
			expectedSuiteCount: number
			expectedTestCount: number
		}) => {
			let actualProject: Project
			let actualFile: File
			let actualSuite: Suite

			const [fileId, suiteId] = props.path

			// biome-ignore lint/suspicious/noDuplicateTestHooks: This is a false positive.
			beforeEach(() => {
				actualProject = applyEvent(
					initialProject,
					suiteStartedEvent({ name: props.name, path: props.path }),
				)

				const file = getFileById(actualProject, fileId)
				assertNotNullish(file)

				actualFile = file

				const suite = getTopLevelSuiteById(file, suiteId)
				assertNotNullish(suite)

				actualSuite = suite
			})

			it("sets the suite status to 'running'", () => {
				expect(actualSuite.status).toBe<SuiteStatus>("running")
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
