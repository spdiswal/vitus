import { applyProjectEvent } from "+events/ProjectEvent"
import { suiteSkippedEvent } from "+events/suite/SuiteSkippedEvent"
import { type Module, countModuleChildren } from "+models/Module"
import { dummyModule } from "+models/Module.fixtures"
import {
	type Project,
	assertDummyModules,
	assertDummyProject,
	assertDummySuites,
	getModuleById,
	getOtherModules,
	getSuiteByPath,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Suite, SuiteStatus } from "+models/Suite"
import {
	type DummySuiteId,
	dummySuite,
	getDummySuitePath,
} from "+models/Suite.fixtures"
import { dummyTest } from "+models/Test.fixtures"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyModule("15b021ef72", { status: "failed" }, [
		dummySuite("15b021ef72_0", { status: "passed" }, [
			dummyTest("15b021ef72_0_1", { status: "passed" }),
		]),
		dummyTest("15b021ef72_1", { status: "failed" }),
		dummySuite("15b021ef72_2", { status: "passed" }, [
			dummyTest("15b021ef72_2_3", { status: "failed" }),
			dummySuite("15b021ef72_2_6", { status: "passed" }, [
				dummyTest("15b021ef72_2_6_7", { status: "passed" }),
				dummyTest("15b021ef72_2_6_9", { status: "passed" }),
			]),
		]),
	]),
	dummyModule("a3fdd8b6c3", { status: "failed" }, [
		dummySuite("a3fdd8b6c3_0", { status: "failed" }, [
			dummyTest("a3fdd8b6c3_0_1", { status: "passed" }),
			dummyTest("a3fdd8b6c3_0_3", { status: "failed" }),
		]),
		dummyTest("a3fdd8b6c3_1", { status: "passed" }),
		dummySuite("a3fdd8b6c3_2", { status: "passed" }, [
			dummyTest("a3fdd8b6c3_2_5", { status: "passed" }),
			dummySuite("a3fdd8b6c3_2_6", { status: "passed" }, [
				dummyTest("a3fdd8b6c3_2_6_7", { status: "failed" }),
				dummyTest("a3fdd8b6c3_2_6_9", { status: "passed" }),
			]),
			dummySuite("a3fdd8b6c3_2_8", { status: "failed" }, [
				dummyTest("a3fdd8b6c3_2_8_1", { status: "passed" }),
				dummyTest("a3fdd8b6c3_2_8_3", { status: "failed" }),
				dummySuite("a3fdd8b6c3_2_8_4", { status: "passed" }, [
					dummyTest("a3fdd8b6c3_2_8_4_1", { status: "passed" }),
				]),
			]),
		]),
		dummyTest("a3fdd8b6c3_3", { status: "failed" }),
		dummySuite("a3fdd8b6c3_4", { status: "failed" }, [
			dummyTest("a3fdd8b6c3_4_5", { status: "failed" }),
		]),
	]),
	dummyModule("-1730f876b4", { status: "passed" }, [
		dummySuite("-1730f876b4_0", { status: "passed" }, [
			dummyTest("-1730f876b4_0_1", { status: "passed" }),
			dummyTest("-1730f876b4_0_3", { status: "passed" }),
			dummySuite("-1730f876b4_0_4", { status: "failed" }, [
				dummyTest("-1730f876b4_0_4_5", { status: "passed" }),
			]),
		]),
		dummyTest("-1730f876b4_7", { status: "passed" }),
		dummyTest("-1730f876b4_9", { status: "failed" }),
	]),
	dummyModule("-e45b128829", { status: "passed" }, [
		dummySuite("-e45b128829_2", { status: "passed" }, [
			dummyTest("-e45b128829_2_1", { status: "passed" }),
		]),
		dummySuite("-e45b128829_4", { status: "passed" }, [
			dummySuite("-e45b128829_4_4", { status: "failed" }, [
				dummyTest("-e45b128829_4_4_3", { status: "failed" }),
				dummySuite("-e45b128829_4_4_6", { status: "passed" }, [
					dummyTest("-e45b128829_4_4_6_5", { status: "passed" }),
				]),
			]),
		]),
	]),
])

beforeAll(() => {
	assertDummyProject(initialProject, { status: "failed" })
	assertDummyModules(initialProject, {
		"15b021ef72": { totalChildCount: 8 },
		a3fdd8b6c3: { totalChildCount: 17 },
		"-1730f876b4": { totalChildCount: 7 },
		"-e45b128829": { totalChildCount: 7 },
	})
	assertDummySuites(initialProject, {
		"15b021ef72_0": {},
		"15b021ef72_2": {},
		"15b021ef72_2_6": {},
		a3fdd8b6c3_0: {},
		a3fdd8b6c3_2: {},
		a3fdd8b6c3_2_6: {},
		a3fdd8b6c3_2_8: {},
		a3fdd8b6c3_2_8_4: {},
		a3fdd8b6c3_4: {},
		"-1730f876b4_0": {},
		"-1730f876b4_0_4": {},
		"-e45b128829_2": {},
		"-e45b128829_4": {},
		"-e45b128829_4_4": {},
		"-e45b128829_4_4_6": {},
	})
})

describe.each`
	suiteId
	${"15b021ef72_0"}
	${"15b021ef72_2"}
	${"15b021ef72_2_6"}
	${"a3fdd8b6c3_0"}
	${"a3fdd8b6c3_4"}
	${"a3fdd8b6c3_2_6"}
	${"a3fdd8b6c3_2_8"}
	${"a3fdd8b6c3_2_8_4"}
	${"-1730f876b4_0"}
	${"-1730f876b4_0_4"}
	${"-e45b128829_2"}
	${"-e45b128829_4_4"}
	${"-e45b128829_4_4_6"}
`(
	"when a suite with id $suiteId has been skipped",
	(props: { suiteId: DummySuiteId }) => {
		const path = getDummySuitePath(props.suiteId)
		const [moduleId] = path

		const initialModule = getModuleById(initialProject, moduleId)
		assertNotNullish(initialModule)

		const initialSuite = getSuiteByPath(initialProject, path)
		assertNotNullish(initialSuite)

		let actualProject: Project
		let actualModule: Module
		let actualSuite: Suite

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				suiteSkippedEvent({ path }),
			)

			const module = getModuleById(actualProject, moduleId)
			assertNotNullish(module)
			actualModule = module

			const suite = getSuiteByPath(actualProject, path)
			assertNotNullish(suite)
			actualSuite = suite
		})

		it("sets the suite status to 'skipped'", () => {
			expect(actualSuite.status).toBe<SuiteStatus>("skipped")
		})

		it("does not affect the number of suites and tests in the module", () => {
			expect(countModuleChildren(actualModule)).toBe(
				countModuleChildren(initialModule),
			)
		})

		it("does not affect the other modules in the project", () => {
			expect(getOtherModules(actualProject, moduleId)).toEqual(
				getOtherModules(initialProject, moduleId),
			)
		})
	},
)

describe.each`
	suiteId
	${"15b021ef72_8"}
	${"15b021ef72_8_4"}
	${"f9bb9e8bc0_0"}
	${"f9bb9e8bc0_0_0"}
`(
	"when a non-existing suite with id $suiteId has been skipped",
	(props: { suiteId: DummySuiteId }) => {
		const path = getDummySuitePath(props.suiteId)

		let actualProject: Project

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				suiteSkippedEvent({ path }),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
