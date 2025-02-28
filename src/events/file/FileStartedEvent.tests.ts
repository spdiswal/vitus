import { applyEvent } from "+events/Event"
import { fileStartedEvent } from "+events/file/FileStartedEvent"
import {
	type File,
	type FileId,
	type FileStatus,
	assertFileChildCount,
	countFileChildren,
} from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertProjectDuration,
	assertProjectFileCount,
	assertProjectStatus,
	getFileById,
	getOtherFiles,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { dummySuite } from "+models/Suite.fixtures"
import { dummyTest } from "+models/Test.fixtures"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyFile("15b021ef72", { duration: 10, status: "passed" }, [
		dummySuite("15b021ef72_0", { status: "passed" }, [
			dummyTest("15b021ef72_0_1", { status: "failed" }),
		]),
		dummyTest("15b021ef72_3", { status: "failed" }),
		dummyTest("15b021ef72_5", { status: "failed" }),
	]),
	dummyFile("a3fdd8b6c3", { duration: 20, status: "failed" }, [
		dummyTest("a3fdd8b6c3_1", { status: "passed" }),
		dummyTest("a3fdd8b6c3_3", { status: "passed" }),
		dummyTest("a3fdd8b6c3_5", { status: "failed" }),
	]),
	dummyFile("-1730f876b4", { duration: 40, status: "passed" }, [
		dummySuite("-1730f876b4_0", { status: "passed" }, [
			dummyTest("-1730f876b4_0_1", { status: "failed" }),
			dummyTest("-1730f876b4_0_3", { status: "passed" }),
			dummyTest("-1730f876b4_0_5", { status: "skipped" }),
		]),
		dummyTest("-1730f876b4_7", { status: "passed" }),
	]),
	dummyFile("-e45b128829", { duration: 80, status: "passed" }, [
		dummySuite("-e45b128829_0", { status: "failed" }, [
			dummyTest("-e45b128829_0_1", { status: "failed" }),
			dummyTest("-e45b128829_0_3", { status: "passed" }),
		]),
		dummyTest("-e45b128829_5", { status: "passed" }),
		dummySuite("-e45b128829_2", { status: "skipped" }, [
			dummyTest("-e45b128829_2_7", { status: "failed" }),
		]),
		dummyTest("-e45b128829_9", { status: "failed" }),
	]),
])

beforeAll(() => {
	assertProjectDuration(initialProject, 10 + 20 + 40 + 80)
	assertProjectStatus(initialProject, "failed")
	assertProjectFileCount(initialProject, 4)
	assertFileChildCount(initialProject.files[0], 4)
	assertFileChildCount(initialProject.files[1], 3)
	assertFileChildCount(initialProject.files[2], 5)
	assertFileChildCount(initialProject.files[3], 7)
})

describe.each`
	id               | filename                   | expectedFilenameOrder
	${"134672b00e"}  | ${"Raspberries.tests.ts"}  | ${["Apples.tests.ts", "Bananas.tests.ts", "Oranges.tests.ts", "Peaches.tests.ts", "Raspberries.tests.ts"]}
	${"28a4cfffe6"}  | ${"lemons.tests.ts"}       | ${["Apples.tests.ts", "Bananas.tests.ts", "lemons.tests.ts", "Oranges.tests.ts", "Peaches.tests.ts"]}
	${"-20e94f4789"} | ${"Limes.tests.ts"}        | ${["Apples.tests.ts", "Bananas.tests.ts", "Limes.tests.ts", "Oranges.tests.ts", "Peaches.tests.ts"]}
	${"-1d9b7a7bcc"} | ${"strawberries.tests.ts"} | ${["Apples.tests.ts", "Bananas.tests.ts", "Oranges.tests.ts", "Peaches.tests.ts", "strawberries.tests.ts"]}
	${"6ab50b9861"}  | ${"Cherries.tests.ts"}     | ${["Apples.tests.ts", "Bananas.tests.ts", "Cherries.tests.ts", "Oranges.tests.ts", "Peaches.tests.ts"]}
	${"44bc1aaa4d"}  | ${"apples.tests.ts"}       | ${["apples.tests.ts", "Apples.tests.ts", "Bananas.tests.ts", "Oranges.tests.ts", "Peaches.tests.ts"]}
`(
	"when a new file named $filename with id $id has started running",
	(props: {
		id: FileId
		filename: string
		expectedFilenameOrder: Array<string>
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

		it("clears the suites and tests in the file", () => {
			expect(actualFile.children).toHaveLength(0)
		})

		it("adds the file to the project", () => {
			expect(actualProject.files).toHaveLength(initialProject.files.length + 1)
			expect(actualProject.files).toContainEqual(actualFile)
		})

		it("sorts the files by their filenames in alphabetic order", () => {
			expect(actualProject.files.map((file) => file.filename)).toEqual(
				props.expectedFilenameOrder,
			)
		})

		it("does not affect the project duration", () => {
			expect(actualProject.duration).toBe(10 + 20 + 40 + 80)
		})

		it("updates the project status based on the latest fileset", () => {
			expect(actualProject.status).toBe<ProjectStatus>("running")
		})
	},
)

describe.each`
	id               | filename              | expectedProjectDuration
	${"15b021ef72"}  | ${"Apples.tests.ts"}  | ${/**/ 20 + 40 + 80}
	${"a3fdd8b6c3"}  | ${"Bananas.tests.ts"} | ${10 + /**/ 40 + 80}
	${"-1730f876b4"} | ${"Oranges.tests.ts"} | ${10 + 20 + /**/ 80}
	${"-e45b128829"} | ${"Peaches.tests.ts"} | ${10 + 20 + 40 /**/}
`(
	"when an existing file named $filename with id $id has started running",
	(props: {
		id: FileId
		filename: string
		expectedProjectDuration: Duration
	}) => {
		const initialFile = getFileById(initialProject, props.id)
		assertNotNullish(initialFile)

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

		it("does not affect the number of suites and tests in the file", () => {
			expect(countFileChildren(actualFile)).toBe(countFileChildren(initialFile))
		})

		it("does not affect the number of files in the project", () => {
			expect(actualProject.files).toHaveLength(initialProject.files.length)
		})

		it("does not affect the other files in the project", () => {
			expect(getOtherFiles(actualProject, props.id)).toEqual(
				getOtherFiles(initialProject, props.id),
			)
		})

		it("updates the project duration based on the latest fileset", () => {
			expect(actualProject.duration).toBe(props.expectedProjectDuration)
		})

		it("updates the project status based on the latest fileset", () => {
			expect(actualProject.status).toBe<ProjectStatus>("running")
		})
	},
)
