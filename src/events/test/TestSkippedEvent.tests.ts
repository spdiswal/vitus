import { applyEvent } from "+events/Event"
import { testSkippedEvent } from "+events/test/TestSkippedEvent"
import {
	type File,
	assertFileChildCount,
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
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({
	files: [
		dummyFile("15b021ef72", {
			suites: [dummySuite("15b021ef72_10", { status: "passed" })],
			tests: [
				dummyTest("15b021ef72_50", { status: "failed" }),
				dummyTest("15b021ef72_51", { status: "failed" }),
			],
		}),
		dummyFile("a3fdd8b6c3", {
			suites: [
				dummySuite("a3fdd8b6c3_10", { status: "failed" }),
				dummySuite("a3fdd8b6c3_11", { status: "passed" }),
				dummySuite("a3fdd8b6c3_12", { status: "passed" }),
			],
			tests: [
				dummyTest("a3fdd8b6c3_50", { status: "passed" }),
				dummyTest("a3fdd8b6c3_51", { status: "passed" }),
				dummyTest("a3fdd8b6c3_52", { status: "failed" }),
			],
		}),
		dummyFile("-1730f876b4", {
			suites: [
				dummySuite("-1730f876b4_10", { status: "failed" }),
				dummySuite("-1730f876b4_11", { status: "passed" }),
			],
			tests: [dummyTest("-1730f876b4_50", { status: "passed" })],
		}),
		dummyFile("-e45b128829", {
			suites: [],
			tests: [
				dummyTest("-e45b128829_50", { status: "passed" }),
				dummyTest("-e45b128829_51", { status: "failed" }),
			],
		}),
	],
})

beforeAll(() => {
	assertProjectFileCount(initialProject, 4)
	assertFileChildCount(initialProject.files[0], 3)
	assertFileChildCount(initialProject.files[1], 6)
	assertFileChildCount(initialProject.files[2], 3)
	assertFileChildCount(initialProject.files[3], 2)
})

describe.each`
	path                                 | duration | expectedSuiteCount | expectedTestCount
	${["15b021ef72", "15b021ef72_50"]}   | ${7}     | ${1}               | ${2}
	${["15b021ef72", "15b021ef72_51"]}   | ${4}     | ${1}               | ${2}
	${["a3fdd8b6c3", "a3fdd8b6c3_50"]}   | ${11}    | ${3}               | ${3}
	${["a3fdd8b6c3", "a3fdd8b6c3_52"]}   | ${9}     | ${3}               | ${3}
	${["-1730f876b4", "-1730f876b4_50"]} | ${16}    | ${2}               | ${1}
	${["-e45b128829", "-e45b128829_51"]} | ${5}     | ${0}               | ${2}
`(
	"when a top-level test with id $path.1 has been skipped",
	(props: {
		path: TestPath
		duration: Duration
		expectedSuiteCount: number
		expectedTestCount: number
	}) => {
		let actualProject: Project
		let actualFile: File
		let actualTest: Test

		const [fileId, testId] = props.path

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				testSkippedEvent({ path: props.path, duration: props.duration }),
			)

			const file = getFileById(actualProject, fileId)
			assertNotNullish(file)

			actualFile = file

			const test = getTopLevelTestById(file, testId)
			assertNotNullish(test)

			actualTest = test
		})

		it("sets the test status to 'skipped'", () => {
			expect(actualTest.status).toBe<TestStatus>("skipped")
		})

		it("updates the test duration", () => {
			expect(actualTest.duration).toBe(props.duration)
		})

		it("does not affect the number of suites in the file", () => {
			expect(actualFile.suites).toHaveLength(props.expectedSuiteCount)
		})

		it("does not affect the number of tests in the file", () => {
			expect(actualFile.tests).toHaveLength(props.expectedTestCount)
		})

		it("does not affect the other files in the project", () => {
			const initialOtherFiles = initialProject.files.filter(
				(file) => file.id !== fileId,
			)
			const actualOtherFiles = actualProject.files.filter(
				(file) => file.id !== fileId,
			)

			expect(actualOtherFiles).toEqual(initialOtherFiles)
		})
	},
)

describe("when a non-existing test has been skipped", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(
			initialProject,
			testSkippedEvent({ path: ["15b021ef72", "15b021ef72_8"], duration: 2 }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})

describe("when a test in a non-existing file has been skipped", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(
			initialProject,
			testSkippedEvent({ path: ["f9bb9e8bc0", "f9bb9e8bc0_0"], duration: 2 }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
