import { applyProjectEvent } from "+events/ProjectEvent"
import { moduleStartedEvent } from "+events/module/ModuleStartedEvent"
import { type Module, getModuleById } from "+models/Module"
import type { Project, ProjectStatus } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { TaskId } from "+models/TaskId"
import type { TaskStatus } from "+models/TaskStatus"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({
	modulesById: {
		"15b021ef72": { status: "passed" },
		"3afdd8b6c3": { status: "failed" },
		"-1730f876b4": { status: "passed" },
		"-e45b128829": { status: "passed" },
	},
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
	"when a new module named $filename with id $id has started",
	(props: {
		id: TaskId
		filename: string
		expectedFilenameOrder: Array<string>
	}) => {
		const moduleId = props.id

		let actualProject: Project
		let actualModule: Module

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				moduleStartedEvent({
					type: "module",
					id: moduleId,
					path: initialProject.rootPath + props.filename,
					filename: props.filename,
					status: "started",
				}),
			)

			const module = getModuleById(actualProject, moduleId)
			assertNotNullish(module)
			actualModule = module
		})

		it("sets the module status to 'started'", () => {
			expect(actualModule.status).toBe<TaskStatus>("started")
		})

		it("adds the module to the project", () => {
			const actualModuleIds = Object.keys(actualProject.modulesById)
			const initialModuleIds = Object.keys(initialProject.modulesById)

			expect(actualModuleIds).toHaveLength(initialModuleIds.length + 1)
			expect(actualModuleIds).toContain(moduleId)
		})

		it("updates the project status based on the latest set of modules", () => {
			expect(actualProject.status).toBe<ProjectStatus>("started")
		})
	},
)

describe.each`
	id
	${"15b021ef72"}
	${"3afdd8b6c3"}
	${"-1730f876b4"}
	${"-e45b128829"}
`(
	"when an existing module named $filename with id $id has started",
	(props: {
		id: TaskId
	}) => {
		const initialModule = getModuleById(initialProject, props.id)
		assertNotNullish(initialModule)

		let actualProject: Project
		let actualModule: Module

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				moduleStartedEvent({ ...initialModule, status: "started" }),
			)

			const module = getModuleById(actualProject, props.id)
			assertNotNullish(module)
			actualModule = module
		})

		it("sets the module status to 'started'", () => {
			expect(actualModule.status).toBe<TaskStatus>("started")
		})

		it("does not affect the set of suites and tests in the project", () => {
			const actualSubtaskIds = Object.keys(actualProject.subtasksById)
			const initialSubtaskIds = Object.keys(initialProject.subtasksById)

			expect(actualSubtaskIds).toEqual(initialSubtaskIds)
		})

		it("does not affect the set of modules in the project", () => {
			const actualModuleIds = Object.keys(actualProject.modulesById)
			const initialModuleIds = Object.keys(initialProject.modulesById)

			expect(actualModuleIds).toHaveLength(initialModuleIds.length)
		})

		it("does not affect the other modules in the project", () => {
			const { [props.id]: initialUpdatedModule, ...initialOtherModules } =
				initialProject.modulesById

			const { [props.id]: actualUpdatedModule, ...actualOtherModules } =
				actualProject.modulesById

			expect(actualOtherModules).toEqual(initialOtherModules)
		})

		it("updates the project status based on the latest set of modules", () => {
			expect(actualProject.status).toBe<ProjectStatus>("started")
		})
	},
)
