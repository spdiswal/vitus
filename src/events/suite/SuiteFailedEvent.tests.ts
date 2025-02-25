import { applyEvent } from "+events/Event"
import { suiteFailedEvent } from "+events/suite/SuiteFailedEvent"
import { type File, getTopLevelSuiteById } from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import { type Project, getFileById } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Suite, SuiteStatus } from "+models/Suite"
import { dummySuite } from "+models/Suite.fixtures"
import type { TestPath } from "+models/Test"
import { dummyTest } from "+models/Test.fixtures"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeEach, describe, expect, it } from "vitest"

describe("given a project of 4 files with a mix of passed and skipped suites", () => {
	const initialProject = dummyProject({
		files: [
			dummyFile("15b021ef72", {
				suites: [
					dummySuite("15b021ef72_10", { status: "passed" }),
					dummySuite("15b021ef72_11", { status: "skipped" }),
				],
				tests: [dummyTest("15b021ef72_50", { status: "passed" })],
			}),
			dummyFile("a3fdd8b6c3", {
				suites: [
					dummySuite("a3fdd8b6c3_10", { status: "passed" }),
					dummySuite("a3fdd8b6c3_11", { status: "skipped" }),
					dummySuite("a3fdd8b6c3_12", { status: "skipped" }),
				],
				tests: [
					dummyTest("a3fdd8b6c3_50", { status: "passed" }),
					dummyTest("a3fdd8b6c3_51", { status: "skipped" }),
				],
			}),
			dummyFile("-1730f876b4", {
				suites: [dummySuite("-1730f876b4_10", { status: "passed" })],
				tests: [
					dummyTest("-1730f876b4_50", { status: "skipped" }),
					dummyTest("-1730f876b4_51", { status: "skipped" }),
				],
			}),
			dummyFile("-e45b128829", {
				suites: [
					dummySuite("-e45b128829_10", { status: "passed" }),
					dummySuite("-e45b128829_11", { status: "passed" }),
				],
				tests: [dummyTest("-e45b128829_50", { status: "skipped" })],
			}),
		],
	})

	it("has 4 files with 2, 3, 1, and 2 suites initially", () => {
		expect(initialProject.files).toHaveLength(4)
		expect(initialProject.files[0].suites).toHaveLength(2)
		expect(initialProject.files[1].suites).toHaveLength(3)
		expect(initialProject.files[2].suites).toHaveLength(1)
		expect(initialProject.files[3].suites).toHaveLength(2)
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
		"when a top-level suite with id $path.1 has failed",
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
					suiteFailedEvent({ path: props.path }),
				)

				const file = getFileById(actualProject, fileId)
				assertNotNullish(file)

				actualFile = file

				const suite = getTopLevelSuiteById(file, suiteId)
				assertNotNullish(suite)

				actualSuite = suite
			})

			it("sets the suite status to 'failed'", () => {
				expect(actualSuite.status).toBe<SuiteStatus>("failed")
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

	describe("when a non-existing suite has failed", () => {
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				suiteFailedEvent({ path: ["15b021ef72", "15b021ef72_8"] }),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	})

	describe("when a suite in a non-existing file has failed", () => {
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				suiteFailedEvent({ path: ["f9bb9e8bc0", "f9bb9e8bc0_0"] }),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	})
})
