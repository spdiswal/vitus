import { applyEvent } from "+events/Event"
import { suitePassedEvent } from "+events/suite/SuitePassedEvent"
import {
	type File,
	assertFileChildCount,
	countFileChildren,
	getTopLevelSuiteById,
} from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	assertProjectFileCount,
	getFileById,
	getOtherFiles,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Suite, SuiteStatus } from "+models/Suite"
import { dummySuite } from "+models/Suite.fixtures"
import type { TestPath } from "+models/Test"
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
			]),
		]),
	]),
])

beforeAll(() => {
	assertProjectFileCount(initialProject, 4)
	assertFileChildCount(initialProject.files[0], 8)
	assertFileChildCount(initialProject.files[1], 15)
	assertFileChildCount(initialProject.files[2], 7)
	assertFileChildCount(initialProject.files[3], 5)
})

describe.each`
	path
	${["15b021ef72", "15b021ef72_0"]}
	${["15b021ef72", "15b021ef72_2"]}
	${["a3fdd8b6c3", "a3fdd8b6c3_0"]}
	${["a3fdd8b6c3", "a3fdd8b6c3_4"]}
	${["-1730f876b4", "-1730f876b4_0"]}
	${["-e45b128829", "-e45b128829_2"]}
`(
	"when a top-level suite with id $path.1 has passed",
	(props: { path: TestPath }) => {
		const [fileId, suiteId] = props.path

		const initialFile = getFileById(initialProject, fileId)
		assertNotNullish(initialFile)

		let actualProject: Project
		let actualFile: File
		let actualSuite: Suite

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				suitePassedEvent({ path: props.path }),
			)

			const file = getFileById(actualProject, fileId)
			assertNotNullish(file)

			actualFile = file

			const suite = getTopLevelSuiteById(file, suiteId)
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

describe("when a non-existing top-level suite has passed", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(
			initialProject,
			suitePassedEvent({ path: ["15b021ef72", "15b021ef72_8"] }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})

describe("when a top-level suite in a non-existing file has passed", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(
			initialProject,
			suitePassedEvent({ path: ["f9bb9e8bc0", "f9bb9e8bc0_0"] }),
		)
	})

	it("does not affect the project", () => {
		expect(actualProject).toEqual(initialProject)
	})
})

// TODO: when a nested suite has passed
