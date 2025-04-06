import { applyProjectEvent } from "+events/ProjectEvent"
import { suitePassedEvent } from "+events/suite/SuitePassedEvent"
import { type File, countFileChildren } from "+models/Module"
import { dummyFile } from "+models/Module.fixtures"
import {
	type Project,
	assertDummyFiles,
	assertDummyProject,
	assertDummySuites,
	getFileById,
	getOtherFiles,
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
	dummyFile("15b021ef72", { duration: 14, status: "skipped" }, [
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
	dummyFile("a3fdd8b6c3", { duration: 6, status: "failed" }, [
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
					dummyTest("a3fdd8b6c3_2_8_4_1", { duration: 3, status: "failed" }),
				]),
			]),
		]),
		dummyTest("a3fdd8b6c3_3", { duration: 4, status: "skipped" }),
		dummySuite("a3fdd8b6c3_4", { status: "skipped" }, [
			dummyTest("a3fdd8b6c3_4_5", { duration: 8, status: "skipped" }),
		]),
	]),
	dummyFile("-1730f876b4", { duration: 9, status: "failed" }, [
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
	dummyFile("-e45b128829", { duration: 11, status: "skipped" }, [
		dummySuite("-e45b128829_2", { status: "failed" }, [
			dummyTest("-e45b128829_2_1", { duration: 9, status: "failed" }),
		]),
		dummySuite("-e45b128829_4", { status: "skipped" }, [
			dummySuite("-e45b128829_4_4", { status: "failed" }, [
				dummyTest("-e45b128829_4_4_3", { duration: 15, status: "skipped" }),
				dummySuite("-e45b128829_4_4_6", { status: "skipped" }, [
					dummyTest("-e45b128829_4_4_6_5", { duration: 6, status: "failed" }),
				]),
			]),
		]),
	]),
])

beforeAll(() => {
	assertDummyProject(initialProject, { duration: 40, status: "failed" })
	assertDummyFiles(initialProject, {
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
	"when a suite with id $suiteId has passed",
	(props: { suiteId: DummySuiteId }) => {
		const path = getDummySuitePath(props.suiteId)
		const [fileId] = path

		const initialFile = getFileById(initialProject, fileId)
		assertNotNullish(initialFile)

		const initialSuite = getSuiteByPath(initialProject, path)
		assertNotNullish(initialSuite)

		let actualProject: Project
		let actualFile: File
		let actualSuite: Suite

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				suitePassedEvent({ path }),
			)

			const file = getFileById(actualProject, fileId)
			assertNotNullish(file)
			actualFile = file

			const suite = getSuiteByPath(actualProject, path)
			assertNotNullish(suite)
			actualSuite = suite
		})

		it("sets the suite status to 'passed'", () => {
			expect(actualSuite.status).toBe<SuiteStatus>("passed")
		})

		it("does not affect the number of suites and tests in the file", () => {
			expect(countFileChildren(actualFile)).toBe(countFileChildren(initialFile))
		})

		it("does not affect the suite duration", () => {
			expect(actualSuite.duration).toBe(initialSuite.duration)
		})

		it("does not affect the other files in the project", () => {
			expect(getOtherFiles(actualProject, fileId)).toEqual(
				getOtherFiles(initialProject, fileId),
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
	"when a non-existing suite with id $suiteId has passed",
	(props: { suiteId: DummySuiteId }) => {
		const path = getDummySuitePath(props.suiteId)

		let actualProject: Project

		beforeEach(() => {
			actualProject = applyProjectEvent(
				initialProject,
				suitePassedEvent({ path }),
			)
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
