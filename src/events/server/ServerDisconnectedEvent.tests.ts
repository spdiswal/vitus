import { applyEvent } from "+events/Event"
import { serverDisconnectedEvent } from "+events/server/ServerDisconnectedEvent"
import { dummyFile } from "+models/File.fixtures"
import type { Project, ProjectStatus } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { TestIds } from "+models/Test"
import { dummyTest } from "+models/Test.fixtures"
import type { Duration } from "+types/Duration"
import { beforeEach, describe, expect, it } from "vitest"

describe("given a project of 4 files with a mix of tests where 2 files have status 'running', 1 file has status 'failed', and 1 file has status 'passed'", () => {
	const initialProject = dummyProject({
		files: [
			dummyFile("15b021ef72", {
				duration: 10,
				status: "running",
				tests: [
					dummyTest("15b021ef72_50", { status: "failed" }),
					dummyTest("15b021ef72_51", { status: "running" }),
				],
			}),
			dummyFile("a3fdd8b6c3", {
				duration: 20,
				status: "passed",
				tests: [
					dummyTest("a3fdd8b6c3_50", { status: "passed" }),
					dummyTest("a3fdd8b6c3_51", { status: "running" }),
					dummyTest("a3fdd8b6c3_52", { status: "failed" }),
				],
			}),
			dummyFile("-1730f876b4", {
				duration: 40,
				status: "passed",
				tests: [
					dummyTest("-1730f876b4_50", { status: "running" }),
					dummyTest("-1730f876b4_51", { status: "passed" }),
					dummyTest("-1730f876b4_52", { status: "running" }),
				],
			}),
			dummyFile("-e45b128829", {
				duration: 80,
				status: "running",
				tests: [
					dummyTest("-e45b128829_50", { status: "running" }),
					dummyTest("-e45b128829_51", { status: "running" }),
				],
			}),
		],
	})

	const initialProjectDuration: Duration = 150

	it("has 4 files initially", () => {
		expect(initialProject.files).toHaveLength(4)
	})

	it("sets the project duration based on the initial files", () => {
		expect(initialProject.duration).toBe(initialProjectDuration)
	})

	it("sets the project status based on the initial files", () => {
		expect(initialProject.status).toBe<ProjectStatus>("running")
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
			expect(actualProject.duration).toBe(initialProjectDuration - 10 - 80)
		})

		it("refreshes the project status based on the remaining files", () => {
			expect(actualProject.status).toBe<ProjectStatus>("passed")
		})
	})
})
