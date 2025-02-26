import { applyEvent } from "+events/Event"
import { suitePassedEvent } from "+events/suite/SuitePassedEvent"
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
				dummySuite("15b021ef72_11", { status: "failed" }),
			],
			tests: [dummyTest("15b021ef72_50", { status: "failed" })],
		}),
		dummyFile("a3fdd8b6c3", {
			suites: [
				dummySuite("a3fdd8b6c3_10", { status: "skipped" }),
				dummySuite("a3fdd8b6c3_11", { status: "failed" }),
				dummySuite("a3fdd8b6c3_12", { status: "skipped" }),
			],
			tests: [
				dummyTest("a3fdd8b6c3_50", { status: "skipped" }),
				dummyTest("a3fdd8b6c3_51", { status: "failed" }),
			],
		}),
		dummyFile("-1730f876b4", {
			suites: [dummySuite("-1730f876b4_10", { status: "skipped" })],
			tests: [
				dummyTest("-1730f876b4_50", { status: "failed" }),
				dummyTest("-1730f876b4_51", { status: "failed" }),
			],
		}),
		dummyFile("-e45b128829", {
			suites: [
				dummySuite("-e45b128829_10", { status: "failed" }),
				dummySuite("-e45b128829_11", { status: "skipped" }),
			],
			tests: [dummyTest("-e45b128829_50", { status: "skipped" })],
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
	"when a top-level suite with id $path.1 has passed",
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
				suitePassedEvent({ path: props.path }),
			)

			const file = getFileById(actualProject, fileId)
			assertNotNullish(file)

			actualFile = file

			const suite = getTopLevelSuiteById(file, suiteId)
			assertNotNullish(suite)

			actualSuite = suite
		})

		it("sets the suite status to 'passed'", () => {
			expect(actualSuite.status).toBe<SuiteStatus>("passed")
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

describe("when a non-existing suite has passed", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(
			initialProject,
			suitePassedEvent({ path: ["15b021ef72", "15b021ef72_8"] }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})

describe("when a suite in a non-existing file has passed", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(
			initialProject,
			suitePassedEvent({ path: ["f9bb9e8bc0", "f9bb9e8bc0_0"] }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
