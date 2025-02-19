import { applyEvent } from "+events/Event"
import { fileStartedEvent } from "+events/file/FileStartedEvent"
import type { File, FileId, FileStatus } from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import { type Project, type ProjectStatus, getFileById } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeEach, describe, expect, it } from "vitest"

describe("given a project of 4 files where 3 files have status 'passed' and 1 file has status 'failed'", () => {
	const initialProject = dummyProject({
		files: [
			dummyFile("15b021ef72", { duration: 10, status: "passed" }),
			dummyFile("a3fdd8b6c3", { duration: 20, status: "failed" }),
			dummyFile("-1730f876b4", { duration: 40, status: "passed" }),
			dummyFile("-e45b128829", { duration: 80, status: "passed" }),
		],
	})

	const initialProjectDuration: Duration = 150

	it("has 4 files initially", () => {
		expect(initialProject.files).toHaveLength(4)
	})

	it("sets the project duration based on the initial files", () => {
		expect(initialProject.duration).toBe(initialProjectDuration)
	})

	it("sets the project status based on the initial files", () => {
		expect(initialProject.status).toBe<ProjectStatus>("failed")
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
				expect(actualProject.duration).toBe(initialProjectDuration)
			})

			it("refreshes the project status based on the updated files", () => {
				expect(actualProject.status).toBe<ProjectStatus>("running")
			})
		},
	)

	describe.each`
		filename              | id               | expectedProjectDuration
		${"Apples.tests.ts"}  | ${"15b021ef72"}  | ${initialProjectDuration - 10}
		${"Bananas.tests.ts"} | ${"a3fdd8b6c3"}  | ${initialProjectDuration - 20}
		${"Oranges.tests.ts"} | ${"-1730f876b4"} | ${initialProjectDuration - 40}
		${"Peaches.tests.ts"} | ${"-e45b128829"} | ${initialProjectDuration - 80}
	`(
		"when an existing file named $filename with id $id has started running",
		(props: {
			filename: string
			id: FileId
			expectedProjectDuration: Duration
		}) => {
			let actualProject: Project
			let actualFile: File

			// biome-ignore lint/suspicious/noDuplicateTestHooks: This is a false positive.
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
})
