import { applyEvent } from "+events/Event"
import { runStartedEvent } from "+events/run/RunStartedEvent"
import type { File, FileId, FileStatus } from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import { type Project, type ProjectStatus, getFileById } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Duration } from "+types/Duration"
import type { Vector } from "+types/Vector"
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
		fileIds                          | expectedProjectDuration
		${["15b021ef72", "-1730f876b4"]} | ${initialProjectDuration - 10 - 40}
		${["a3fdd8b6c3", "-1730f876b4"]} | ${initialProjectDuration - 20 - 40}
		${["a3fdd8b6c3", "-e45b128829"]} | ${initialProjectDuration - 20 - 80}
	`(
		"when a run has started for 2 files with ids $fileIds.0 and $fileIds.1",
		(props: {
			fileIds: Vector<FileId, 2>
			expectedProjectDuration: Duration
		}) => {
			let actualProject: Project
			let actualFiles: Vector<File, 2>

			beforeEach(() => {
				actualProject = applyEvent(
					initialProject,
					runStartedEvent({ invalidatedFileIds: props.fileIds }),
				)

				const fileA = getFileById(actualProject, props.fileIds[0])
				const fileB = getFileById(actualProject, props.fileIds[1])

				assertNotNullish(fileA)
				assertNotNullish(fileB)

				actualFiles = [fileA, fileB]
			})

			it("sets the file statuses to 'running'", () => {
				expect(actualFiles[0].status).toBe<FileStatus>("running")
				expect(actualFiles[1].status).toBe<FileStatus>("running")
			})

			it("clears the file durations", () => {
				expect(actualFiles[0].duration).toBe(0)
				expect(actualFiles[1].duration).toBe(0)
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

	describe("when a run has started for a non-existing file", () => {
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				runStartedEvent({ invalidatedFileIds: ["f9bb9e8bc0"] }),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	})
})
