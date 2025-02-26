import { applyEvent } from "+events/Event"
import { suiteSkippedEvent } from "+events/suite/SuiteSkippedEvent"
import {
	type File,
	assertFileChildCount,
	getTopLevelSuiteById,
} from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	assertProjectFileCount,
	getFileById,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Suite, SuiteStatus } from "+models/Suite"
import { dummySuite } from "+models/Suite.fixtures"
import type { TestPath } from "+models/Test"
import { dummyTest } from "+models/Test.fixtures"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({
	files: [
		dummyFile("15b021ef72", {
			suites: [
				dummySuite("15b021ef72_10", { status: "failed" }),
				dummySuite("15b021ef72_11", { status: "passed" }),
			],
			tests: [dummyTest("15b021ef72_50", { status: "failed" })],
		}),
		dummyFile("a3fdd8b6c3", {
			suites: [
				dummySuite("a3fdd8b6c3_10", { status: "failed" }),
				dummySuite("a3fdd8b6c3_11", { status: "failed" }),
				dummySuite("a3fdd8b6c3_12", { status: "passed" }),
			],
			tests: [
				dummyTest("a3fdd8b6c3_50", { status: "passed" }),
				dummyTest("a3fdd8b6c3_51", { status: "passed" }),
			],
		}),
		dummyFile("-1730f876b4", {
			suites: [dummySuite("-1730f876b4_10", { status: "passed" })],
			tests: [
				dummyTest("-1730f876b4_50", { status: "passed" }),
				dummyTest("-1730f876b4_51", { status: "failed" }),
			],
		}),
		dummyFile("-e45b128829", {
			suites: [
				dummySuite("-e45b128829_10", { status: "passed" }),
				dummySuite("-e45b128829_11", { status: "passed" }),
			],
			tests: [dummyTest("-e45b128829_50", { status: "failed" })],
		}),
	],
})

beforeAll(() => {
	assertProjectFileCount(initialProject, 4)
	assertFileChildCount(initialProject.files[0], 3)
	assertFileChildCount(initialProject.files[1], 5)
	assertFileChildCount(initialProject.files[2], 3)
	assertFileChildCount(initialProject.files[3], 3)
})

describe.each`
	path                                 | expectedSuiteCount | expectedTestCount
	${["15b021ef72", "15b021ef72_10"]}   | ${2}               | ${1}
	${["15b021ef72", "15b021ef72_11"]}   | ${2}               | ${1}
	${["a3fdd8b6c3", "a3fdd8b6c3_10"]}   | ${3}               | ${2}
	${["a3fdd8b6c3", "a3fdd8b6c3_12"]}   | ${3}               | ${2}
	${["-1730f876b4", "-1730f876b4_10"]} | ${1}               | ${2}
	${["-e45b128829", "-e45b128829_11"]} | ${2}               | ${1}
`(
	"when a top-level suite with id $path.1 has been skipped",
	(props: {
		path: TestPath
		expectedSuiteCount: number
		expectedTestCount: number
	}) => {
		let actualProject: Project
		let actualFile: File
		let actualSuite: Suite

		const [fileId, suiteId] = props.path

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				suiteSkippedEvent({ path: props.path }),
			)

			const file = getFileById(actualProject, fileId)
			assertNotNullish(file)

			actualFile = file

			const suite = getTopLevelSuiteById(file, suiteId)
			assertNotNullish(suite)

			actualSuite = suite
		})

		it("sets the suite status to 'skipped'", () => {
			expect(actualSuite.status).toBe<SuiteStatus>("skipped")
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

describe("when a non-existing suite has been skipped", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(
			initialProject,
			suiteSkippedEvent({ path: ["15b021ef72", "15b021ef72_8"] }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})

describe("when a suite in a non-existing file has been skipped", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(
			initialProject,
			suiteSkippedEvent({ path: ["f9bb9e8bc0", "f9bb9e8bc0_0"] }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
