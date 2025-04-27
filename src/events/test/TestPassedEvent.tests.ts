import { applyProjectEvent } from "+events/ProjectEvent"
import { testPassedEvent } from "+events/test/TestPassedEvent"
import { type Module, countModuleChildren } from "+models/Module"
import { dummyModule } from "+models/Module.fixtures"
import {
	type Project,
	assertDummyModules,
	assertDummyProject,
	assertDummySuites,
	getModuleById,
	getOtherModules,
	getTestByPath,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { dummySuite } from "+models/Suite.fixtures"
import type { Test, TestStatus } from "+models/Test"
import {
	type DummyTestId,
	dummyTest,
	getDummyTestPath,
} from "+models/Test.fixtures"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyModule("15b021ef72", { status: "skipped" }, [
		dummySuite("15b021ef72_0", { status: "failed" }, [
			dummyTest("15b021ef72_0_1", { status: "failed" }),
		]),
		dummyTest("15b021ef72_1", { status: "skipped" }),
		dummySuite("15b021ef72_2", { status: "skipped" }, [
			dummyTest("15b021ef72_2_3", { status: "failed" }),
			dummySuite("15b021ef72_2_6", { status: "failed" }, [
				dummyTest("15b021ef72_2_6_7", { status: "failed" }),
				dummyTest("15b021ef72_2_6_9", { status: "skipped" }),
			]),
		]),
	]),
	dummyModule("a3fdd8b6c3", { status: "failed" }, [
		dummySuite("a3fdd8b6c3_0", { status: "failed" }, [
			dummyTest("a3fdd8b6c3_0_1", { status: "skipped" }),
			dummyTest("a3fdd8b6c3_0_3", { status: "failed" }),
		]),
		dummyTest("a3fdd8b6c3_1", { status: "failed" }),
		dummySuite("a3fdd8b6c3_2", { status: "failed" }, [
			dummyTest("a3fdd8b6c3_2_5", { status: "failed" }),
			dummySuite("a3fdd8b6c3_2_6", { status: "skipped" }, [
				dummyTest("a3fdd8b6c3_2_6_7", { status: "skipped" }),
				dummyTest("a3fdd8b6c3_2_6_9", { status: "skipped" }),
			]),
			dummySuite("a3fdd8b6c3_2_8", { status: "failed" }, [
				dummyTest("a3fdd8b6c3_2_8_1", { status: "failed" }),
				dummyTest("a3fdd8b6c3_2_8_3", { status: "skipped" }),
				dummySuite("a3fdd8b6c3_2_8_4", { status: "failed" }, [
					dummyTest("a3fdd8b6c3_2_8_4_1", { status: "passed" }),
				]),
			]),
		]),
		dummyTest("a3fdd8b6c3_3", { status: "skipped" }),
		dummySuite("a3fdd8b6c3_4", { status: "skipped" }, [
			dummyTest("a3fdd8b6c3_4_5", { status: "skipped" }),
		]),
	]),
	dummyModule("-1730f876b4", { status: "failed" }, [
		dummySuite("-1730f876b4_0", { status: "failed" }, [
			dummyTest("-1730f876b4_0_1", { status: "failed" }),
			dummyTest("-1730f876b4_0_3", { status: "skipped" }),
			dummySuite("-1730f876b4_0_4", { status: "skipped" }, [
				dummyTest("-1730f876b4_0_4_5", { status: "failed" }),
			]),
		]),
		dummyTest("-1730f876b4_7", { status: "failed" }),
		dummyTest("-1730f876b4_9", { status: "failed" }),
	]),
	dummyModule("-e45b128829", { status: "skipped" }, [
		dummySuite("-e45b128829_2", { status: "failed" }, [
			dummyTest("-e45b128829_2_1", { status: "failed" }),
		]),
		dummySuite("-e45b128829_4", { status: "skipped" }, [
			dummySuite("-e45b128829_4_4", { status: "failed" }, [
				dummyTest("-e45b128829_4_4_3", { status: "skipped" }),
				dummySuite("-e45b128829_4_4_6", { status: "skipped" }, [
					dummyTest("-e45b128829_4_4_6_5", { status: "skipped" }),
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
	testId
	${"15b021ef72_1"}
	${"15b021ef72_0_1"}
	${"15b021ef72_2_6_9"}
	${"a3fdd8b6c3_1"}
	${"a3fdd8b6c3_3"}
	${"a3fdd8b6c3_0_3"}
	${"a3fdd8b6c3_2_6_7"}
	${"a3fdd8b6c3_2_8_4_1"}
	${"-1730f876b4_7"}
	${"-1730f876b4_9"}
	${"-1730f876b4_0_1"}
	${"-1730f876b4_0_4_5"}
	${"-e45b128829_2_1"}
	${"-e45b128829_4_4_3"}
	${"-e45b128829_4_4_6_5"}
`(
	"when a test with id $testId has passed",
	(props: {
		testId: DummyTestId
	}) => {
		const path = getDummyTestPath(props.testId)
		const [moduleId] = path

		const initialModule = getModuleById(initialProject, moduleId)
		assertNotNullish(initialModule)

		let actualProject: Project
		let actualModule: Module
		let actualTest: Test

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				testPassedEvent({ path }),
			)

			const module = getModuleById(actualProject, moduleId)
			assertNotNullish(module)
			actualModule = module

			const test = getTestByPath(actualProject, path)
			assertNotNullish(test)
			actualTest = test
		})

		it("sets the test status to 'passed'", () => {
			expect(actualTest.status).toBe<TestStatus>("passed")
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
	testId
	${"-1730f876b4_0_5"}
	${"-1730f876b4_0_4_9"}
	${"f9bb9e8bc0_1"}
	${"f9bb9e8bc0_0_1"}
`(
	"when a non-existing test with id $testId has passed",
	(props: {
		testId: DummyTestId
	}) => {
		const path = getDummyTestPath(props.testId)

		let actualProject: Project

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				testPassedEvent({ path }),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
