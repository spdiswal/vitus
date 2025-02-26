import { applyEvent } from "+events/Event"
import { fileStartedEvent } from "+events/file/FileStartedEvent"
import type { File, FileId, FileStatus } from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertProjectDuration,
	assertProjectFileCount,
	assertProjectStatus,
	getFileById,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { dummySuite } from "+models/Suite.fixtures"
import { dummyTest } from "+models/Test.fixtures"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({
	files: [
		dummyFile("15b021ef72", {
			duration: 10,
			status: "passed",
			suites: [dummySuite("15b021ef72_10", { status: "passed" })],
			tests: [
				dummyTest("15b021ef72_50", { status: "failed" }),
				dummyTest("15b021ef72_51", { status: "failed" }),
			],
		}),
		dummyFile("a3fdd8b6c3", {
			duration: 20,
			status: "failed",
			suites: [],
			tests: [
				dummyTest("a3fdd8b6c3_50", { status: "passed" }),
				dummyTest("a3fdd8b6c3_51", { status: "passed" }),
				dummyTest("a3fdd8b6c3_52", { status: "failed" }),
			],
		}),
		dummyFile("-1730f876b4", {
			duration: 40,
			status: "passed",
			suites: [dummySuite("-1730f876b4_10", { status: "passed" })],
			tests: [dummyTest("-1730f876b4_50", { status: "passed" })],
		}),
		dummyFile("-e45b128829", {
			duration: 80,
			status: "passed",
			suites: [
				dummySuite("-e45b128829_10", { status: "failed" }),
				dummySuite("-e45b128829_11", { status: "skipped" }),
			],
			tests: [
				dummyTest("-e45b128829_50", { status: "passed" }),
				dummyTest("-e45b128829_51", { status: "failed" }),
			],
		}),
	],
})

beforeAll(() => {
	assertProjectDuration(initialProject, 10 + 20 + 40 + 80)
	assertProjectFileCount(initialProject, 4)
	assertProjectStatus(initialProject, "failed")
})

describe.each`
	filename                   | id               | expectedFilenames
	${"Raspberries.tests.ts"}  | ${"134672b00e"}  | ${["Apples.tests.ts", "Bananas.tests.ts", "Oranges.tests.ts", "Peaches.tests.ts", "Raspberries.tests.ts"]}
	${"lemons.tests.ts"}       | ${"28a4cfffe6"}  | ${["Apples.tests.ts", "Bananas.tests.ts", "lemons.tests.ts", "Oranges.tests.ts", "Peaches.tests.ts"]}
	${"Limes.tests.ts"}        | ${"-20e94f4789"} | ${["Apples.tests.ts", "Bananas.tests.ts", "Limes.tests.ts", "Oranges.tests.ts", "Peaches.tests.ts"]}
	${"strawberries.tests.ts"} | ${"-1d9b7a7bcc"} | ${["Apples.tests.ts", "Bananas.tests.ts", "Oranges.tests.ts", "Peaches.tests.ts", "strawberries.tests.ts"]}
	${"Cherries.tests.ts"}     | ${"6ab50b9861"}  | ${["Apples.tests.ts", "Bananas.tests.ts", "Cherries.tests.ts", "Oranges.tests.ts", "Peaches.tests.ts"]}
	${"apples.tests.ts"}       | ${"44bc1aaa4d"}  | ${["apples.tests.ts", "Apples.tests.ts", "Bananas.tests.ts", "Oranges.tests.ts", "Peaches.tests.ts"]}
`(
	"when a new file named $filename with id $id has started running",
	(props: {
		filename: string
		id: FileId
		expectedFilenames: Array<string>
	}) => {
		let actualProject: Project
		let actualFile: File

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				fileStartedEvent({
					id: props.id,
					path: initialProject.rootPath + props.filename,
				}),
			)

			const file = getFileById(actualProject, props.id)
			assertNotNullish(file)

			actualFile = file
		})

		it("sets the file status to 'running'", () => {
			expect(actualFile.status).toBe<FileStatus>("running")
		})

		it("clears the file duration", () => {
			expect(actualFile.duration).toBe(0)
		})

		it("clears the suites in the file", () => {
			expect(actualFile.suites).toHaveLength(0)
		})

		it("clears the tests in the file", () => {
			expect(actualFile.tests).toHaveLength(0)
		})

		it("adds the file to the project", () => {
			expect(actualProject.files).toHaveLength(5)
			expect(actualProject.files).toContainEqual(actualFile)
		})

		it("sorts the files by their filenames in alphabetic order", () => {
			expect(actualProject.files.map((file) => file.filename)).toEqual(
				props.expectedFilenames,
			)
		})

		it("does not affect the project duration", () => {
			expect(actualProject.duration).toBe(10 + 20 + 40 + 80)
		})

		it("refreshes the project status based on the updated files", () => {
			expect(actualProject.status).toBe<ProjectStatus>("running")
		})
	},
)

describe.each`
	filename              | id               | expectedProjectDuration | expectedSuiteCount | expectedTestCount
	${"Apples.tests.ts"}  | ${"15b021ef72"}  | ${/**/ 20 + 40 + 80}    | ${1}               | ${2}
	${"Bananas.tests.ts"} | ${"a3fdd8b6c3"}  | ${10 + /**/ 40 + 80}    | ${0}               | ${3}
	${"Oranges.tests.ts"} | ${"-1730f876b4"} | ${10 + 20 + /**/ 80}    | ${1}               | ${1}
	${"Peaches.tests.ts"} | ${"-e45b128829"} | ${10 + 20 + 40 /**/}    | ${2}               | ${2}
`(
	"when an existing file named $filename with id $id has started running",
	(props: {
		filename: string
		id: FileId
		expectedProjectDuration: Duration
		expectedSuiteCount: number
		expectedTestCount: number
	}) => {
		let actualProject: Project
		let actualFile: File

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				fileStartedEvent({
					id: props.id,
					path: initialProject.rootPath + props.filename,
				}),
			)

			const file = getFileById(actualProject, props.id)
			assertNotNullish(file)

			actualFile = file
		})

		it("sets the file status to 'running'", () => {
			expect(actualFile.status).toBe<FileStatus>("running")
		})

		it("clears the file duration", () => {
			expect(actualFile.duration).toBe(0)
		})

		it("preserves the suites in the file", () => {
			expect(actualFile.suites).toHaveLength(props.expectedSuiteCount)
		})

		it("preserves the tests in the file", () => {
			expect(actualFile.tests).toHaveLength(props.expectedTestCount)
		})

		it("does not affect the number of files", () => {
			expect(actualProject.files).toHaveLength(4)
		})

		it("refreshes the project duration based on the updated files", () => {
			expect(actualProject.duration).toBe(props.expectedProjectDuration)
		})

		it("refreshes the project status based on the updated files", () => {
			expect(actualProject.status).toBe<ProjectStatus>("running")
		})
	},
)
