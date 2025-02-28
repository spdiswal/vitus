import { applyEvent } from "+events/Event"
import { suiteStartedEvent } from "+events/suite/SuiteStartedEvent"
import {
	type File,
	assertFileChildCount,
	countFileChildren,
	getFileChildIds,
	getTopLevelSuiteById,
} from "+models/File"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	assertProjectFileCount,
	getFileById,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Suite, SuitePath, SuiteStatus } from "+models/Suite"
import { dummySuite } from "+models/Suite.fixtures"
import { dummyTest } from "+models/Test.fixtures"
import { assertNotNullish } from "+utilities/Assertions"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyFile("15b021ef72", { duration: 14, status: "failed" }, [
		dummySuite("15b021ef72_0", { status: "failed" }, [
			dummyTest("15b021ef72_0_1", { status: "failed" }),
		]),
		dummyTest("15b021ef72_1", { status: "passed" }),
		dummySuite("15b021ef72_2", { status: "passed" }, [
			dummyTest("15b021ef72_2_3", { status: "skipped" }),
			dummySuite("15b021ef72_2_6", { status: "passed" }, [
				dummyTest("15b021ef72_2_6_7", { status: "passed" }),
				dummyTest("15b021ef72_2_6_9", { status: "skipped" }),
			]),
		]),
	]),
	dummyFile("a3fdd8b6c3", { duration: 6, status: "running" }, [
		dummySuite("a3fdd8b6c3_0", { status: "failed" }, [
			dummyTest("a3fdd8b6c3_0_1", { status: "passed" }),
			dummyTest("a3fdd8b6c3_0_3", { status: "failed" }),
		]),
		dummyTest("a3fdd8b6c3_1", { status: "skipped" }),
		dummySuite("a3fdd8b6c3_2", { status: "skipped" }, [
			dummyTest("a3fdd8b6c3_2_5", { status: "failed" }),
			dummySuite("a3fdd8b6c3_2_6", { status: "failed" }, [
				dummyTest("a3fdd8b6c3_2_6_7", { status: "passed" }),
				dummyTest("a3fdd8b6c3_2_6_9", { status: "passed" }),
			]),
			dummySuite("a3fdd8b6c3_2_8", { status: "passed" }, [
				dummyTest("a3fdd8b6c3_2_8_1", { status: "passed" }),
				dummyTest("a3fdd8b6c3_2_8_3", { status: "skipped" }),
			]),
		]),
		dummyTest("a3fdd8b6c3_3", { status: "failed" }),
		dummySuite("a3fdd8b6c3_4", { status: "skipped" }, [
			dummyTest("a3fdd8b6c3_4_5", { status: "skipped" }),
		]),
	]),
	dummyFile("-1730f876b4", { duration: 9, status: "passed" }, [
		dummySuite("-1730f876b4_0", { status: "passed" }, [
			dummyTest("-1730f876b4_0_1", { status: "failed" }),
			dummyTest("-1730f876b4_0_3", { status: "skipped" }),
			dummySuite("-1730f876b4_0_4", { status: "passed" }, [
				dummyTest("-1730f876b4_0_4_5", { status: "skipped" }),
			]),
		]),
		dummyTest("-1730f876b4_7", { status: "skipped" }),
		dummyTest("-1730f876b4_9", { status: "failed" }),
	]),
	dummyFile("-e45b128829", { duration: 11, status: "skipped" }, [
		dummySuite("-e45b128829_2", { status: "failed" }, [
			dummyTest("-e45b128829_2_1", { status: "failed" }),
		]),
		dummySuite("-e45b128829_4", { status: "passed" }, [
			dummySuite("-e45b128829_4_4", { status: "passed" }, [
				dummyTest("-e45b128829_4_4_3", { status: "passed" }),
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
	path                                 | name                                             | expectedChildIdOrder
	${["15b021ef72", "15b021ef72_6"]}    | ${"when the computer needs charging"}            | ${["15b021ef72_0", "15b021ef72_0_1", "15b021ef72_1", "15b021ef72_2", "15b021ef72_2_3", "15b021ef72_2_6", "15b021ef72_2_6_7", "15b021ef72_2_6_9", "15b021ef72_6"]}
	${["a3fdd8b6c3", "a3fdd8b6c3_8"]}    | ${"when the fridge is out of soft drinks"}       | ${["a3fdd8b6c3_0", "a3fdd8b6c3_0_1", "a3fdd8b6c3_0_3", "a3fdd8b6c3_1", "a3fdd8b6c3_2", "a3fdd8b6c3_2_5", "a3fdd8b6c3_2_6", "a3fdd8b6c3_2_6_7", "a3fdd8b6c3_2_6_9", "a3fdd8b6c3_2_8", "a3fdd8b6c3_2_8_1", "a3fdd8b6c3_2_8_3", "a3fdd8b6c3_3", "a3fdd8b6c3_4", "a3fdd8b6c3_4_5", "a3fdd8b6c3_8"]}
	${["-1730f876b4", "-1730f876b4_4"]}  | ${"when staying at the hotel"}                   | ${["-1730f876b4_0", "-1730f876b4_0_1", "-1730f876b4_0_3", "-1730f876b4_0_4", "-1730f876b4_0_4_5", "-1730f876b4_4", "-1730f876b4_7", "-1730f876b4_9"]}
	${["-1730f876b4", "-1730f876b4_12"]} | ${"when the keyboard backlight is on"}           | ${["-1730f876b4_0", "-1730f876b4_0_1", "-1730f876b4_0_3", "-1730f876b4_0_4", "-1730f876b4_0_4_5", "-1730f876b4_7", "-1730f876b4_9", "-1730f876b4_12"]}
	${["-e45b128829", "-e45b128829_0"]}  | ${"when the bus is late"}                        | ${["-e45b128829_0", "-e45b128829_2", "-e45b128829_2_1", "-e45b128829_4", "-e45b128829_4_4", "-e45b128829_4_4_3"]}
	${["-e45b128829", "-e45b128829_20"]} | ${"when ordering a large meal with extra fries"} | ${["-e45b128829_2", "-e45b128829_2_1", "-e45b128829_4", "-e45b128829_4_4", "-e45b128829_4_4_3", "-e45b128829_20"]}
`(
	"when a new top-level suite with id $path.1 has started running",
	(props: {
		path: SuitePath
		name: string
		expectedChildIdOrder: Array<string>
	}) => {
		const [fileId, suiteId] = props.path

		const initialFile = getFileById(initialProject, fileId)
		assertNotNullish(initialFile)

		let actualProject: Project
		let actualFile: File
		let actualSuite: Suite

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				suiteStartedEvent({ name: props.name, path: props.path }),
			)

			const file = getFileById(actualProject, fileId)
			assertNotNullish(file)

			actualFile = file

			const suite = getTopLevelSuiteById(file, suiteId)
			assertNotNullish(suite)

			actualSuite = suite
		})

		it("sets the suite status to 'running'", () => {
			expect(actualSuite.status).toBe<SuiteStatus>("running")
		})

		it("adds the suite to the file", () => {
			expect(actualFile.children).toHaveLength(initialFile.children.length + 1)
			expect(actualFile.children).toContainEqual(actualSuite)
		})

		it("sorts the suites and tests by their id", () => {
			expect(getFileChildIds(actualFile)).toEqual(props.expectedChildIdOrder)
		})

		// TODO: updates the suite duration based on its tests

		it("does not affect the file duration", () => {
			expect(actualFile.duration).toBe(initialFile.duration)
		})

		it("does not affect the file status", () => {
			expect(actualFile.status).toBe(initialFile.status)
		})
	},
)

describe.each`
	path                                | name
	${["15b021ef72", "15b021ef72_0"]}   | ${"when the fruit basket has no apples"}
	${["15b021ef72", "15b021ef72_2"]}   | ${"when the spring break is over"}
	${["a3fdd8b6c3", "a3fdd8b6c3_2"]}   | ${"when the summer break is over"}
	${["a3fdd8b6c3", "a3fdd8b6c3_4"]}   | ${"when the music stops playing"}
	${["-1730f876b4", "-1730f876b4_0"]} | ${"when the fruit basket has no oranges"}
	${["-e45b128829", "-e45b128829_4"]} | ${"when the movie stops playing"}
`(
	"when an existing suite with id $path.1 has started running",
	(props: {
		path: SuitePath
		name: string
	}) => {
		const [fileId, suiteId] = props.path

		const initialFile = getFileById(initialProject, fileId)
		assertNotNullish(initialFile)

		let actualProject: Project
		let actualFile: File
		let actualSuite: Suite

		beforeEach(() => {
			actualProject = applyEvent(
				initialProject,
				suiteStartedEvent({ name: props.name, path: props.path }),
			)

			const file = getFileById(actualProject, fileId)
			assertNotNullish(file)

			actualFile = file

			const suite = getTopLevelSuiteById(file, suiteId)
			assertNotNullish(suite)

			actualSuite = suite
		})

		it("sets the suite status to 'running'", () => {
			expect(actualSuite.status).toBe<SuiteStatus>("running")
		})

		it("does not affect the number of suites and tests in the file", () => {
			expect(countFileChildren(actualFile)).toBe(countFileChildren(initialFile))
		})

		// TODO: does not affect the suite duration

		it("does not affect the file duration", () => {
			expect(actualFile.duration).toBe(initialFile.duration)
		})

		it("does not affect the file status", () => {
			expect(actualFile.status).toBe(initialFile.status)
		})
	},
)

// TODO: when a nested suite has started running
