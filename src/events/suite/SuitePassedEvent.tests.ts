import { applyEvent } from "+events/Event"
import { suitePassedEvent } from "+events/suite/SuitePassedEvent"
import {
	type File,
	assertFileChildCount,
	countFileChildren,
} from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	assertProjectFileCount,
	getFileById,
	getOtherFiles,
	getSuiteByPath,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Suite, SuiteStatus } from "+models/Suite"
import {
	type DummySuiteId,
	dummySuite,
	getPathFromDummySuiteId,
} from "+models/Suite.fixtures"
import { dummyTest } from "+models/Test.fixtures"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyFile("15b021ef72", {}, [
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
	dummyFile("a3fdd8b6c3", {}, [
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
					dummyTest("a3fdd8b6c3_2_8_4_1", { status: "failed" }),
				]),
			]),
		]),
		dummyTest("a3fdd8b6c3_3", { status: "skipped" }),
		dummySuite("a3fdd8b6c3_4", { status: "skipped" }, [
			dummyTest("a3fdd8b6c3_4_5", { status: "skipped" }),
		]),
	]),
	dummyFile("-1730f876b4", {}, [
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
	dummyFile("-e45b128829", {}, [
		dummySuite("-e45b128829_2", { status: "failed" }, [
			dummyTest("-e45b128829_2_1", { status: "failed" }),
		]),
		dummySuite("-e45b128829_4", { status: "skipped" }, [
			dummySuite("-e45b128829_4_4", { status: "failed" }, [
				dummyTest("-e45b128829_4_4_3", { status: "skipped" }),
				dummySuite("-e45b128829_4_4_6", { status: "skipped" }, [
					dummyTest("-e45b128829_4_4_6_5", { status: "failed" }),
				]),
			]),
		]),
	]),
])

beforeAll(() => {
	assertProjectFileCount(initialProject, 4)
	assertFileChildCount(initialProject.files[0], 8)
	assertFileChildCount(initialProject.files[1], 17)
	assertFileChildCount(initialProject.files[2], 7)
	assertFileChildCount(initialProject.files[3], 7)
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
		const path = getPathFromDummySuiteId(props.suiteId)
		const [fileId] = path

		const initialFile = getFileById(initialProject, fileId)
		assertNotNullish(initialFile)

		let actualProject: Project
		let actualFile: File
		let actualSuite: Suite

		beforeEach(() => {
			actualProject = applyEvent(initialProject, suitePassedEvent({ path }))

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

		// TODO: does not affect the suite duration

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
		const path = getPathFromDummySuiteId(props.suiteId)

		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(initialProject, suitePassedEvent({ path }))
		})

		it("does not affect the project", () => {
			expect(actualProject).toEqual(initialProject)
		})
	},
)
