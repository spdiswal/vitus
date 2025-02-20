import { applyEvent } from "+events/Event"
import { runCompletedEvent } from "+events/run/RunCompletedEvent"
import { dummyFile } from "+models/File.fixtures"
import type { Project, ProjectStatus } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Duration } from "+types/Duration"
import { beforeEach, describe, expect, it } from "vitest"

describe("given a project of 4 files where 1 file has status 'passed', 1 file has status 'failed', and 2 files have status 'running'", () => {
	const initialProject = dummyProject({
		files: [
			dummyFile("15b021ef72", { duration: 10, status: "passed" }),
			dummyFile("a3fdd8b6c3", { duration: 20, status: "running" }),
			dummyFile("-1730f876b4", { duration: 40, status: "running" }),
			dummyFile("-e45b128829", { duration: 80, status: "failed" }),
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

	describe("when the run has completed", () => {
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(initialProject, runCompletedEvent())
		})

		it("discards unfinished files", () => {
			expect(actualProject.files.map((file) => file.filename)).toEqual([
				"Apples.tests.ts",
				"Peaches.tests.ts",
			])
		})

		it("refreshes the project duration based on the remaining files", () => {
			expect(actualProject.duration).toBe(initialProjectDuration - 20 - 40)
		})

		it("refreshes the project status based on the remaining files", () => {
			expect(actualProject.status).toBe<ProjectStatus>("failed")
		})
	})
})
