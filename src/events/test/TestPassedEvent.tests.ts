import { applyEvent } from "+events/Event"
import { testPassedEvent } from "+events/test/TestPassedEvent"
import { type File, getTopLevelTestById } from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import { type Project, getFileById } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Test, TestPath, TestStatus } from "+models/Test"
import { dummyTest } from "+models/Test.fixtures"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeEach, describe, expect, it } from "vitest"

describe("given a project of 4 files with a mix of failed and skipped tests", () => {
	const initialProject = dummyProject({
		files: [
			dummyFile("15b021ef72", {
				tests: [
					dummyTest("15b021ef72_50", { status: "failed" }),
					dummyTest("15b021ef72_51", { status: "failed" }),
				],
			}),
			dummyFile("a3fdd8b6c3", {
				tests: [
					dummyTest("a3fdd8b6c3_50", { status: "failed" }),
					dummyTest("a3fdd8b6c3_51", { status: "skipped" }),
					dummyTest("a3fdd8b6c3_52", { status: "failed" }),
				],
			}),
			dummyFile("-1730f876b4", {
				tests: [dummyTest("-1730f876b4_50", { status: "skipped" })],
			}),
			dummyFile("-e45b128829", {
				tests: [
					dummyTest("-e45b128829_50", { status: "failed" }),
					dummyTest("-e45b128829_51", { status: "skipped" }),
				],
			}),
		],
	})

	it("has 4 files with 2, 3, 1, and 2 tests initially", () => {
		expect(initialProject.files).toHaveLength(4)
		expect(initialProject.files[0].tests).toHaveLength(2)
		expect(initialProject.files[1].tests).toHaveLength(3)
		expect(initialProject.files[2].tests).toHaveLength(1)
		expect(initialProject.files[3].tests).toHaveLength(2)
	})

	describe.each`
		path                                 | duration | expectedTestCount
		${["15b021ef72", "15b021ef72_50"]}   | ${7}     | ${2}
		${["15b021ef72", "15b021ef72_51"]}   | ${4}     | ${2}
		${["a3fdd8b6c3", "a3fdd8b6c3_50"]}   | ${11}    | ${3}
		${["a3fdd8b6c3", "a3fdd8b6c3_52"]}   | ${9}     | ${3}
		${["-1730f876b4", "-1730f876b4_50"]} | ${16}    | ${1}
		${["-e45b128829", "-e45b128829_51"]} | ${5}     | ${2}
	`(
		"when a top-level test with id $path.1 has passed",
		(props: {
			path: TestPath
			duration: Duration
			expectedTestCount: number
		}) => {
			let actualProject: Project
			let actualFile: File
			let actualTest: Test

			const [fileId, testId] = props.path

			beforeEach(() => {
				actualProject = applyEvent(
					initialProject,
					testPassedEvent({ path: props.path, duration: props.duration }),
				)

				const file = getFileById(actualProject, fileId)
				assertNotNullish(file)

				actualFile = file

				const test = getTopLevelTestById(file, testId)
				assertNotNullish(test)

				actualTest = test
			})

			it("sets the test status to 'passed'", () => {
				expect(actualTest.status).toBe<TestStatus>("passed")
			})

			it("updates the test duration", () => {
				expect(actualTest.duration).toBe(props.duration)
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

	describe("when a non-existing test has passed", () => {
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				testPassedEvent({ path: ["15b021ef72", "15b021ef72_8"], duration: 2 }),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	})

	describe("when a test in a non-existing file has passed", () => {
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				testPassedEvent({ path: ["f9bb9e8bc0", "f9bb9e8bc0_0"], duration: 2 }),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	})
})
