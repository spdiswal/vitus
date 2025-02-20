import { applyEvent } from "+events/Event"
import { serverRestartedEvent } from "+events/server/ServerRestartedEvent"
import { dummyFile } from "+models/File.fixtures"
import type { Project, ProjectStatus } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Duration } from "+types/Duration"
import { beforeEach, describe, expect, it } from "vitest"

describe("given a project of 4 files where 2 files have status 'passed' and 2 files have status 'failed'", () => {
	const initialProject = dummyProject({
		files: [
			dummyFile("15b021ef72", { duration: 10, status: "failed" }),
			dummyFile("a3fdd8b6c3", { duration: 20, status: "passed" }),
			dummyFile("-1730f876b4", { duration: 40, status: "passed" }),
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
		expect(initialProject.status).toBe<ProjectStatus>("failed")
	})

	describe("when the server has restarted", () => {
		let actualProject: Project

		beforeEach(() => {
			actualProject = applyEvent(initialProject, serverRestartedEvent())
		})

		it("is still connected", () => {
			expect(actualProject.isConnected).toBe(true)
		})

		it("does not affect the project root path", () => {
			expect(actualProject.rootPath).toBe(initialProject.rootPath)
		})

		it("clears all files", () => {
			expect(actualProject.files).toHaveLength(0)
		})

		it("refreshes the project duration based on the remaining files", () => {
			expect(actualProject.duration).toBe(0)
		})

		it("refreshes the project status based on the remaining files", () => {
			expect(actualProject.status).toBe<ProjectStatus>("passed")
		})
	})
})
