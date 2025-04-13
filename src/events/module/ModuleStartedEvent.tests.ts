import { applyProjectEvent } from "+events/ProjectEvent"
import { moduleStartedEvent } from "+events/module/ModuleStartedEvent"
import {
	type Module,
	type ModuleId,
	type ModuleStatus,
	countModuleChildren,
} from "+models/Module"
import { dummyModule } from "+models/Module.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertDummyModules,
	assertDummyProject,
	getModuleById,
	getOtherModules,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { dummySuite } from "+models/Suite.fixtures"
import { dummyTest } from "+models/Test.fixtures"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyModule("15b021ef72", { duration: 10, status: "passed" }, [
		dummySuite("15b021ef72_0", { status: "passed" }, [
			dummyTest("15b021ef72_0_1", { status: "failed" }),
		]),
		dummyTest("15b021ef72_3", { status: "failed" }),
		dummyTest("15b021ef72_5", { status: "failed" }),
	]),
	dummyModule("a3fdd8b6c3", { duration: 20, status: "failed" }, [
		dummyTest("a3fdd8b6c3_1", { status: "passed" }),
		dummyTest("a3fdd8b6c3_3", { status: "passed" }),
		dummyTest("a3fdd8b6c3_5", { status: "failed" }),
	]),
	dummyModule("-1730f876b4", { duration: 40, status: "passed" }, [
		dummySuite("-1730f876b4_0", { status: "passed" }, [
			dummyTest("-1730f876b4_0_1", { status: "failed" }),
			dummyTest("-1730f876b4_0_3", { status: "passed" }),
			dummyTest("-1730f876b4_0_5", { status: "skipped" }),
		]),
		dummyTest("-1730f876b4_7", { status: "passed" }),
	]),
	dummyModule("-e45b128829", { duration: 80, status: "passed" }, [
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
	assertDummyProject(initialProject, { duration: 150, status: "failed" })
	assertDummyModules(initialProject, {
		"15b021ef72": { totalChildCount: 4 },
		a3fdd8b6c3: { totalChildCount: 3 },
		"-1730f876b4": { totalChildCount: 5 },
		"-e45b128829": { totalChildCount: 7 },
	})
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
	"when a new module named $filename with id $id has started running",
	(props: {
		id: ModuleId
		filename: string
		expectedFilenameOrder: Array<string>
	}) => {
		let actualProject: Project
		let actualModule: Module

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				moduleStartedEvent({
					id: props.id,
					path: initialProject.rootPath + props.filename,
				}),
			)

			const module = getModuleById(actualProject, props.id)
			assertNotNullish(module)
			actualModule = module
		})

		it("sets the module status to 'running'", () => {
			expect(actualModule.status).toBe<ModuleStatus>("running")
		})

		it("clears the module duration", () => {
			expect(actualModule.duration).toBe(0)
		})

		it("clears the suites and tests in the module", () => {
			expect(actualModule.suitesAndTests).toHaveLength(0)
		})

		it("adds the module to the project", () => {
			expect(actualProject.modules).toHaveLength(
				initialProject.modules.length + 1,
			)
			expect(actualProject.modules).toContainEqual(actualModule)
		})

		it("sorts the modules by their filenames in alphabetic order", () => {
			expect(actualProject.modules.map((module) => module.filename)).toEqual(
				props.expectedFilenameOrder,
			)
		})

		it("does not affect the project duration", () => {
			expect(actualProject.duration).toBe(10 + 20 + 40 + 80)
		})

		it("updates the project status based on the latest set of modules", () => {
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
	"when an existing module named $filename with id $id has started running",
	(props: {
		id: ModuleId
		filename: string
		expectedProjectDuration: Duration
	}) => {
		const initialModule = getModuleById(initialProject, props.id)
		assertNotNullish(initialModule)

		let actualProject: Project
		let actualModule: Module

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				moduleStartedEvent({
					id: props.id,
					path: initialProject.rootPath + props.filename,
				}),
			)

			const module = getModuleById(actualProject, props.id)
			assertNotNullish(module)
			actualModule = module
		})

		it("sets the module status to 'running'", () => {
			expect(actualModule.status).toBe<ModuleStatus>("running")
		})

		it("clears the module duration", () => {
			expect(actualModule.duration).toBe(0)
		})

		it("does not affect the number of suites and tests in the module", () => {
			expect(countModuleChildren(actualModule)).toBe(
				countModuleChildren(initialModule),
			)
		})

		it("does not affect the number of modules in the project", () => {
			expect(actualProject.modules).toHaveLength(initialProject.modules.length)
		})

		it("does not affect the other modules in the project", () => {
			expect(getOtherModules(actualProject, props.id)).toEqual(
				getOtherModules(initialProject, props.id),
			)
		})

		it("updates the project duration based on the latest set of modules", () => {
			expect(actualProject.duration).toBe(props.expectedProjectDuration)
		})

		it("updates the project status based on the latest set of modules", () => {
			expect(actualProject.status).toBe<ProjectStatus>("running")
		})
	},
)
