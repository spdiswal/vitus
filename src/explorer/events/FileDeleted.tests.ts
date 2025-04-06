import { moduleDeleted } from "+api/events/ModuleDeletedDto"
import type { StateDto } from "+api/models/StateDto"
import { dummyStateDto } from "+api/models/StateDto.fixtures"
import { handleEvent } from "+explorer/events/HandleEvent"
import { initialiseState } from "+explorer/models/State"
import { beforeEach, describe, expect, it } from "vitest"

// const initialProject = dummyProject({}, [
// 	dummyFile("15b021ef72", { duration: 10, status: "passed" }),
// 	dummyFile("a3fdd8b6c3", { duration: 20, status: "passed" }),
// 	dummyFile("-1730f876b4", { duration: 40, status: "running" }),
// 	dummyFile("-e45b128829", { duration: 80, status: "passed" }),
// ])
//
// beforeAll(() => {
// 	assertDummyProject(initialProject, { duration: 150, status: "running" })
// })
//
// describe.each`
// 	id               | expectedProjectDuration | expectedProjectStatus
// 	${"15b021ef72"}  | ${/**/ 20 + 40 + 80}    | ${"running"}
// 	${"a3fdd8b6c3"}  | ${10 + /**/ 40 + 80}    | ${"running"}
// 	${"-1730f876b4"} | ${10 + 20 + /**/ 80}    | ${"passed"}
// 	${"-e45b128829"} | ${10 + 20 + 40 /**/}    | ${"running"}
// `(
// 	"when an existing file $id has been deleted",
// 	(props: {
// 		id: DummyFileId
// 		expectedProjectDuration: Duration
// 		expectedProjectStatus: ProjectStatus
// 	}) => {
// 		const deletedPath = getDummyFilePath(props.id)
//
// 		let actualProject: Project
//
// 		beforeEach(() => {
// 			applyProjectEvent(initialProject, fileDeletedEvent(deletedPath))
// 		})
//
// 		it("forgets about the deleted file", () => {
// 			expect(actualProject.files).toHaveLength(initialProject.files.length - 1)
// 			expect(actualProject.files.map((file) => file.path)).not.toContain(
// 				deletedPath,
// 			)
// 		})
//
// 		it("updates the project duration based on the latest fileset", () => {
// 			expect(actualProject.duration).toBe(props.expectedProjectDuration)
// 		})
//
// 		it("updates the project status based on the latest fileset", () => {
// 			expect(actualProject.status).toBe(props.expectedProjectStatus)
// 		})
// 	},
// )

describe("when a non-existing file has been deleted", () => {
	const initialState = dummyStateDto()
	let actualState: StateDto

	beforeEach(() => {
		initialiseState(initialState)

		handleEvent(
			moduleDeleted(
				"/Users/spdiswal/repositories/plantation/src/basket/Imaginary.tests.ts",
			),
		)

		// actualState = serialiseProject(project)
	})

	it("does not affect the project", () => {
		expect(actualState).toEqual(initialState)
	})
})
