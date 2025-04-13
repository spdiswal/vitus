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
	getSuiteByPath,
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
import { getParentSuitePath } from "+models/TestPath"
import type { Duration } from "+types/Duration"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyModule("15b021ef72", { duration: 14, status: "skipped" }, [
		dummySuite("15b021ef72_0", { status: "failed" }, [
			dummyTest("15b021ef72_0_1", { duration: 1, status: "failed" }),
		]),
		dummyTest("15b021ef72_1", { duration: 2, status: "skipped" }),
		dummySuite("15b021ef72_2", { status: "skipped" }, [
			dummyTest("15b021ef72_2_3", { duration: 3, status: "failed" }),
			dummySuite("15b021ef72_2_6", { status: "failed" }, [
				dummyTest("15b021ef72_2_6_7", { duration: 2, status: "failed" }),
				dummyTest("15b021ef72_2_6_9", { duration: 4, status: "skipped" }),
			]),
		]),
	]),
	dummyModule("a3fdd8b6c3", { duration: 6, status: "failed" }, [
		dummySuite("a3fdd8b6c3_0", { status: "failed" }, [
			dummyTest("a3fdd8b6c3_0_1", { duration: 1, status: "skipped" }),
			dummyTest("a3fdd8b6c3_0_3", { duration: 7, status: "failed" }),
		]),
		dummyTest("a3fdd8b6c3_1", { duration: 6, status: "failed" }),
		dummySuite("a3fdd8b6c3_2", { status: "failed" }, [
			dummyTest("a3fdd8b6c3_2_5", { duration: 8, status: "failed" }),
			dummySuite("a3fdd8b6c3_2_6", { status: "skipped" }, [
				dummyTest("a3fdd8b6c3_2_6_7", { duration: 5, status: "skipped" }),
				dummyTest("a3fdd8b6c3_2_6_9", { duration: 7, status: "skipped" }),
			]),
			dummySuite("a3fdd8b6c3_2_8", { status: "failed" }, [
				dummyTest("a3fdd8b6c3_2_8_1", { duration: 10, status: "failed" }),
				dummyTest("a3fdd8b6c3_2_8_3", { duration: 2, status: "skipped" }),
				dummySuite("a3fdd8b6c3_2_8_4", { status: "failed" }, [
					dummyTest("a3fdd8b6c3_2_8_4_1", { duration: 3, status: "passed" }),
				]),
			]),
		]),
		dummyTest("a3fdd8b6c3_3", { duration: 4, status: "skipped" }),
		dummySuite("a3fdd8b6c3_4", { status: "skipped" }, [
			dummyTest("a3fdd8b6c3_4_5", { duration: 8, status: "skipped" }),
		]),
	]),
	dummyModule("-1730f876b4", { duration: 9, status: "failed" }, [
		dummySuite("-1730f876b4_0", { status: "failed" }, [
			dummyTest("-1730f876b4_0_1", { duration: 29, status: "failed" }),
			dummyTest("-1730f876b4_0_3", { duration: 11, status: "skipped" }),
			dummySuite("-1730f876b4_0_4", { status: "skipped" }, [
				dummyTest("-1730f876b4_0_4_5", { duration: 18, status: "failed" }),
			]),
		]),
		dummyTest("-1730f876b4_7", { duration: 14, status: "failed" }),
		dummyTest("-1730f876b4_9", { duration: 19, status: "failed" }),
	]),
	dummyModule("-e45b128829", { duration: 11, status: "skipped" }, [
		dummySuite("-e45b128829_2", { status: "failed" }, [
			dummyTest("-e45b128829_2_1", { duration: 9, status: "failed" }),
		]),
		dummySuite("-e45b128829_4", { status: "skipped" }, [
			dummySuite("-e45b128829_4_4", { status: "failed" }, [
				dummyTest("-e45b128829_4_4_3", { duration: 15, status: "skipped" }),
				dummySuite("-e45b128829_4_4_6", { status: "skipped" }, [
					dummyTest("-e45b128829_4_4_6_5", { duration: 6, status: "skipped" }),
				]),
			]),
		]),
	]),
])

beforeAll(() => {
	assertDummyProject(initialProject, { duration: 40, status: "failed" })
	assertDummyModules(initialProject, {
		"15b021ef72": { totalChildCount: 8 },
		a3fdd8b6c3: { totalChildCount: 17 },
		"-1730f876b4": { totalChildCount: 7 },
		"-e45b128829": { totalChildCount: 7 },
	})
	assertDummySuites(initialProject, {
		"15b021ef72_0": { duration: 1 },
		"15b021ef72_2": { duration: 9 },
		"15b021ef72_2_6": { duration: 6 },
		a3fdd8b6c3_0: { duration: 8 },
		a3fdd8b6c3_2: { duration: 35 },
		a3fdd8b6c3_2_6: { duration: 12 },
		a3fdd8b6c3_2_8: { duration: 15 },
		a3fdd8b6c3_2_8_4: { duration: 3 },
		a3fdd8b6c3_4: { duration: 8 },
		"-1730f876b4_0": { duration: 58 },
		"-1730f876b4_0_4": { duration: 18 },
		"-e45b128829_2": { duration: 9 },
		"-e45b128829_4": { duration: 21 },
		"-e45b128829_4_4": { duration: 21 },
		"-e45b128829_4_4_6": { duration: 6 },
	})
})

describe.each`
	testId                   | duration | expectedSuiteDuration
	${"15b021ef72_1"}        | ${7}     | ${null}
	${"15b021ef72_0_1"}      | ${9}     | ${9}
	${"15b021ef72_2_6_9"}    | ${13}    | ${15}
	${"a3fdd8b6c3_1"}        | ${11}    | ${null}
	${"a3fdd8b6c3_3"}        | ${6}     | ${null}
	${"a3fdd8b6c3_0_3"}      | ${15}    | ${16}
	${"a3fdd8b6c3_2_6_7"}    | ${8}     | ${15}
	${"a3fdd8b6c3_2_8_4_1"}  | ${1}     | ${1}
	${"-1730f876b4_7"}       | ${14}    | ${null}
	${"-1730f876b4_9"}       | ${5}     | ${null}
	${"-1730f876b4_0_1"}     | ${12}    | ${41}
	${"-1730f876b4_0_4_5"}   | ${3}     | ${3}
	${"-e45b128829_2_1"}     | ${4}     | ${4}
	${"-e45b128829_4_4_3"}   | ${10}    | ${16}
	${"-e45b128829_4_4_6_5"} | ${2}     | ${2}
`(
	"when a test with id $testId has passed",
	(props: {
		testId: DummyTestId
		duration: Duration
		expectedSuiteDuration: Duration | null
	}) => {
		const path = getDummyTestPath(props.testId)
		const [moduleId] = path

		const suitePath = getParentSuitePath(path)

		const initialModule = getModuleById(initialProject, moduleId)
		assertNotNullish(initialModule)

		let actualProject: Project
		let actualModule: Module
		let actualTest: Test

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				testPassedEvent({ path, duration: props.duration }),
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

		it("updates the test duration", () => {
			expect(actualTest.duration).toBe(props.duration)
		})

		it("does not affect the number of suites and tests in the module", () => {
			expect(countModuleChildren(actualModule)).toBe(
				countModuleChildren(initialModule),
			)
		})

		if (suitePath !== null) {
			it("updates the parent suite duration", () => {
				const actualParentSuite = getSuiteByPath(actualProject, suitePath)
				assertNotNullish(actualParentSuite)

				expect(actualParentSuite.duration).toBe(props.expectedSuiteDuration)
			})
		}

		it("does not affect the other modules in the project", () => {
			expect(getOtherModules(actualProject, moduleId)).toEqual(
				getOtherModules(initialProject, moduleId),
			)
		})
	},
)

describe.each`
	testId                 | duration
	${"-1730f876b4_0_5"}   | ${2}
	${"-1730f876b4_0_4_9"} | ${11}
	${"f9bb9e8bc0_1"}      | ${6}
	${"f9bb9e8bc0_0_1"}    | ${5}
`(
	"when a non-existing test with id $testId has passed",
	(props: {
		testId: DummyTestId
		duration: Duration
	}) => {
		const path = getDummyTestPath(props.testId)

		let actualProject: Project

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				testPassedEvent({ path, duration: props.duration }),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
