import { applyEvent } from "+events/Event"
import { fileDeletedEvent } from "+events/file/FileDeletedEvent"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertProjectDuration,
	assertProjectFileCount,
	assertProjectStatus,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Duration } from "+types/Duration"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({
	files: [
		dummyFile("15b021ef72", { duration: 10, status: "passed" }),
		dummyFile("a3fdd8b6c3", { duration: 20, status: "passed" }),
		dummyFile("-1730f876b4", { duration: 40, status: "running" }),
		dummyFile("-e45b128829", { duration: 80, status: "passed" }),
	],
})

beforeAll(() => {
	assertProjectDuration(initialProject, 10 + 20 + 40 + 80)
	assertProjectFileCount(initialProject, 4)
	assertProjectStatus(initialProject, "running")
})

describe.each`
	deletedFilename       | expectedProjectDuration | expectedProjectStatus
	${"Apples.tests.ts"}  | ${/**/ 20 + 40 + 80}    | ${"running"}
	${"Bananas.tests.ts"} | ${10 + /**/ 40 + 80}    | ${"running"}
	${"Oranges.tests.ts"} | ${10 + 20 + /**/ 80}    | ${"passed"}
	${"Peaches.tests.ts"} | ${10 + 20 + 40 /**/}    | ${"running"}
`(
	"when an existing file $deletedFilename has been deleted",
	(props: {
		deletedFilename: string
		expectedProjectDuration: Duration
		expectedProjectStatus: ProjectStatus
	}) => {
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				fileDeletedEvent({
					path: `/Users/sdi/repositories/plantation/src/basket/${props.deletedFilename}`,
				}),
			)
		})

		it("forgets about the deleted file", () => {
			expect(actualProject.files).toHaveLength(3)
			expect(actualProject.files.map((file) => file.filename)).not.toContain(
				props.deletedFilename,
			)
		})

		it("refreshes the project duration based on the remaining files", () => {
			expect(actualProject.duration).toBe(props.expectedProjectDuration)
		})

		it("refreshes the project status based on the remaining files", () => {
			expect(actualProject.status).toBe(props.expectedProjectStatus)
		})
	},
)

describe("when a non-existing file has been deleted", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(
			initialProject,
			fileDeletedEvent({
				path: "/Users/sdi/repositories/plantation/src/basket/Imaginary.tests.ts",
			}),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})
