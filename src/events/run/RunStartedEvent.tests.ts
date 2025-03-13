import { applyProjectEvent } from "+events/ProjectEvent"
import { runStartedEvent } from "+events/run/RunStartedEvent"
import type { File, FileId, FileStatus } from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertDummyProject,
	getFileById,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Duration } from "+types/Duration"
import type { Vector } from "+types/Vector"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyFile("15b021ef72", { duration: 10, status: "passed" }),
	dummyFile("a3fdd8b6c3", { duration: 20, status: "failed" }),
	dummyFile("-1730f876b4", { duration: 40, status: "passed" }),
	dummyFile("-e45b128829", { duration: 80, status: "passed" }),
])

beforeAll(() => {
	assertDummyProject(initialProject, { duration: 150, status: "failed" })
})

describe.each`
	fileIds                          | expectedProjectDuration
	${["15b021ef72", "-1730f876b4"]} | ${/**/ 20 + /**/ 80}
	${["a3fdd8b6c3", "-1730f876b4"]} | ${10 + /**/ /**/ 80}
	${["a3fdd8b6c3", "-e45b128829"]} | ${10 + /**/ 40 /**/}
`(
	"when a run has started for 2 files with ids $fileIds.0 and $fileIds.1",
	(props: {
		fileIds: Vector<FileId, 2>
		expectedProjectDuration: Duration
	}) => {
		let actualProject: Project
		let actualFiles: Vector<File, 2>

		beforeEach(() => {
			actualProject = applyProjectEvent(
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

		it("does not affect the number of files in the project", () => {
			expect(actualProject.files).toHaveLength(initialProject.files.length)
		})

		it("updates the project duration based on the latest fileset", () => {
			expect(actualProject.duration).toBe(props.expectedProjectDuration)
		})

		it("updates the project status based on the latest fileset", () => {
			expect(actualProject.status).toBe<ProjectStatus>("running")
		})
	},
)

describe("when a run has started for a non-existing file", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyProjectEvent(
			initialProject,
			runStartedEvent({ invalidatedFileIds: ["f9bb9e8bc0"] }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
