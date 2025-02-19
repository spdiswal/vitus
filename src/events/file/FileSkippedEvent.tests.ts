import { applyEvent } from "+events/Event"
import { fileSkippedEvent } from "+events/file/FileSkippedEvent"
import type { File, FileId, FileStatus } from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import { type Project, type ProjectStatus, getFileById } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeEach, describe, expect, it } from "vitest"

describe("given a project of 4 files where 3 files have status 'passed' and 1 file has status 'running'", () => {
	const initialProject = dummyProject({
		files: [
			dummyFile("15b021ef72", { duration: 1, status: "passed" }),
			dummyFile("a3fdd8b6c3", { duration: 3, status: "passed" }),
			dummyFile("-1730f876b4", { duration: 5, status: "passed" }),
			dummyFile("-e45b128829", { duration: 7, status: "running" }),
		],
	})

	const initialProjectDuration: Duration = 16

	it("has 4 files initially", () => {
		expect(initialProject.files).toHaveLength(4)
	})

	it("sets the project duration based on the initial files", () => {
		expect(initialProject.duration).toBe(initialProjectDuration)
	})

	it("sets the project status based on the initial files", () => {
		expect(initialProject.status).toBe<ProjectStatus>("running")
	})

	describe.each`
		id               | duration | expectedProjectDuration            | expectedProjectStatus
		${"15b021ef72"}  | ${11}    | ${initialProjectDuration - 1 + 11} | ${"running"}
		${"a3fdd8b6c3"}  | ${6}     | ${initialProjectDuration - 3 + 6}  | ${"running"}
		${"-1730f876b4"} | ${4}     | ${initialProjectDuration - 5 + 4}  | ${"running"}
		${"-e45b128829"} | ${9}     | ${initialProjectDuration - 7 + 9}  | ${"passed"}
	`(
		"when an existing file with id $id has been skipped",
		(props: {
			id: FileId
			duration: Duration
			expectedProjectDuration: Duration
			expectedProjectStatus: ProjectStatus
		}) => {
			let actualProject: Project
			let actualFile: File

			beforeEach(() => {
				actualProject = applyEvent(
					initialProject,
					fileSkippedEvent({ id: props.id, duration: props.duration }),
				)

				const file = getFileById(actualProject, props.id)
				assertNotNullish(file)

				actualFile = file
			})

			it("sets the file status to 'skipped'", () => {
				expect(actualFile.status).toBe<FileStatus>("skipped")
			})

			it("updates the file duration", () => {
				expect(actualFile.duration).toBe(props.duration)
			})

			it("does not affect the number of files", () => {
				expect(actualProject.files).toHaveLength(4)
			})

			it("refreshes the project duration based on the updated files", () => {
				expect(actualProject.duration).toBe(props.expectedProjectDuration)
			})

			it("refreshes the project status based on the updated files", () => {
				expect(actualProject.status).toBe(props.expectedProjectStatus)
			})
		},
	)

	describe("when a non-existing file has been skipped", () => {
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				fileSkippedEvent({ id: "f9bb9e8bc0", duration: 8 }),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	})
})
