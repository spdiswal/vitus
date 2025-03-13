import { applyProjectEvent } from "+events/ProjectEvent"
import { fileSkippedEvent } from "+events/file/FileSkippedEvent"
import type { File, FileId, FileStatus } from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertDummyProject,
	getFileById,
	getOtherFiles,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyFile("15b021ef72", { duration: 1, status: "passed" }),
	dummyFile("a3fdd8b6c3", { duration: 3, status: "passed" }),
	dummyFile("-1730f876b4", { duration: 5, status: "passed" }),
	dummyFile("-e45b128829", { duration: 7, status: "running" }),
])

beforeAll(() => {
	assertDummyProject(initialProject, { duration: 16, status: "running" })
})

describe.each`
	id               | duration | expectedProjectDuration | expectedProjectStatus
	${"15b021ef72"}  | ${11}    | ${11 + 3 + 5 + 7}       | ${"running"}
	${"a3fdd8b6c3"}  | ${6}     | ${1 + 6 + 5 + 7}        | ${"running"}
	${"-1730f876b4"} | ${4}     | ${1 + 3 + 4 + 7}        | ${"running"}
	${"-e45b128829"} | ${9}     | ${1 + 3 + 5 + 9}        | ${"passed"}
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
			actualProject = applyProjectEvent(
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
			expect(actualProject.status).toBe(props.expectedProjectStatus)
		})
	},
)

describe("when a non-existing file has been skipped", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyProjectEvent(
			initialProject,
			fileSkippedEvent({ id: "f9bb9e8bc0", duration: 8 }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
