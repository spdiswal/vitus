import { applyProjectEvent } from "+events/ProjectEvent"
import { filePassedEvent } from "+events/file/FilePassedEvent"
import type { GlobalStatus } from "+models/GlobalStatus"
import type { File, FileId, FileStatus } from "+models/Module"
import { dummyFile } from "+models/Module.fixtures"
import {
	type Project,
	assertDummyProject,
	getFileById,
	getOtherFiles,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyFile("15b021ef72", { duration: 1, status: "failed" }),
	dummyFile("a3fdd8b6c3", { duration: 3, status: "skipped" }),
	dummyFile("-1730f876b4", { duration: 5, status: "skipped" }),
	dummyFile("-e45b128829", { duration: 7, status: "skipped" }),
])

beforeAll(() => {
	assertDummyProject(initialProject, { duration: 16, status: "failed" })
})

describe.each`
	id               | duration | expectedProjectDuration | expectedProjectStatus
	${"15b021ef72"}  | ${4}     | ${4 + 3 + 5 + 7}        | ${"passed"}
	${"a3fdd8b6c3"}  | ${8}     | ${1 + 8 + 5 + 7}        | ${"failed"}
	${"-1730f876b4"} | ${1}     | ${1 + 3 + 1 + 7}        | ${"failed"}
	${"-e45b128829"} | ${5}     | ${1 + 3 + 5 + 5}        | ${"failed"}
`(
	"when an existing file with id $id has passed",
	(props: {
		id: FileId
		duration: Duration
		expectedProjectDuration: Duration
		expectedProjectStatus: GlobalStatus
	}) => {
		let actualProject: Project
		let actualFile: File

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				filePassedEvent({ id: props.id, duration: props.duration }),
			)

			const file = getFileById(actualProject, props.id)
			assertNotNullish(file)
			actualFile = file
		})

		it("sets the file status to 'passed'", () => {
			expect(actualFile.status).toBe<FileStatus>("passed")
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

describe("when a non-existing file has passed", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyProjectEvent(
			initialProject,
			filePassedEvent({ id: "f9bb9e8bc0", duration: 8 }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
