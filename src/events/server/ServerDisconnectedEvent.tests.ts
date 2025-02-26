import { applyEvent } from "+events/Event"
import { serverDisconnectedEvent } from "+events/server/ServerDisconnectedEvent"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertProjectDuration,
	assertProjectFileCount,
	assertProjectStatus,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { SuiteIds } from "+models/Suite"
import { dummySuite } from "+models/Suite.fixtures"
import type { TestIds } from "+models/Test"
import { dummyTest } from "+models/Test.fixtures"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({
	files: [
		dummyFile("15b021ef72", {
			duration: 10,
			status: "running",
			suites: [
				dummySuite("15b021ef72_10", { status: "passed" }),
				dummySuite("15b021ef72_11", { status: "skipped" }),
				dummySuite("15b021ef72_12", { status: "running" }),
			],
			tests: [
				dummyTest("15b021ef72_50", { status: "failed" }),
				dummyTest("15b021ef72_51", { status: "running" }),
			],
		}),
		dummyFile("a3fdd8b6c3", {
			duration: 20,
			status: "passed",
			suites: [
				dummySuite("a3fdd8b6c3_10", { status: "failed" }),
				dummySuite("a3fdd8b6c3_11", { status: "passed" }),
			],
			tests: [
				dummyTest("a3fdd8b6c3_50", { status: "passed" }),
				dummyTest("a3fdd8b6c3_51", { status: "running" }),
				dummyTest("a3fdd8b6c3_52", { status: "failed" }),
			],
		}),
		dummyFile("-1730f876b4", {
			duration: 40,
			status: "passed",
			suites: [
				dummySuite("-1730f876b4_10", { status: "skipped" }),
				dummySuite("-1730f876b4_11", { status: "running" }),
			],
			tests: [
				dummyTest("-1730f876b4_50", { status: "running" }),
				dummyTest("-1730f876b4_51", { status: "passed" }),
				dummyTest("-1730f876b4_52", { status: "running" }),
			],
		}),
		dummyFile("-e45b128829", {
			duration: 80,
			status: "running",
			suites: [
				dummySuite("-e45b128829_10", { status: "passed" }),
				dummySuite("-e45b128829_11", { status: "running" }),
			],
			tests: [
				dummyTest("-e45b128829_50", { status: "running" }),
				dummyTest("-e45b128829_51", { status: "running" }),
			],
		}),
	],
})

beforeAll(() => {
	assertProjectDuration(initialProject, 10 + 20 + 40 + 80)
	assertProjectFileCount(initialProject, 4)
	assertProjectStatus(initialProject, "running")
})

describe("when the server has disconnected", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyEvent(initialProject, serverDisconnectedEvent())
	})

	it("is no longer connected", () => {
		expect(actualProject.isConnected).toBe(false)
	})

	it("does not affect the project root path", () => {
		expect(actualProject.rootPath).toBe(initialProject.rootPath)
	})

	it("discards unfinished files", () => {
		const actualFilenames = actualProject.files.map((file) => file.filename)

		expect(actualFilenames).toEqual<Array<string>>([
			"Bananas.tests.ts",
			"Oranges.tests.ts",
		])
	})

	it("discards unfinished suites", () => {
		const actualSuiteIds = actualProject.files
			.flatMap((file) => file.suites)
			.map((suite) => suite.id)

		expect(actualSuiteIds).toEqual<SuiteIds>([
			"a3fdd8b6c3_10",
			"a3fdd8b6c3_11",
			"-1730f876b4_10",
		])
	})

	it("discards unfinished tests", () => {
		const actualTestIds = actualProject.files
			.flatMap((file) => file.tests)
			.map((test) => test.id)

		expect(actualTestIds).toEqual<TestIds>([
			"a3fdd8b6c3_50",
			"a3fdd8b6c3_52",
			"-1730f876b4_51",
		])
	})

	it("refreshes the project duration based on the remaining files", () => {
		expect(actualProject.duration).toBe(20 + 40)
	})

	it("refreshes the project status based on the remaining files", () => {
		expect(actualProject.status).toBe<ProjectStatus>("passed")
	})
})
