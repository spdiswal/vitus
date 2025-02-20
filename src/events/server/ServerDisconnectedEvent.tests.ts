import { applyEvent } from "+events/Event"
import { serverDisconnectedEvent } from "+events/server/ServerDisconnectedEvent"
import { dummyFile } from "+models/File.fixtures"
import type { Project, ProjectStatus } from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import type { Duration } from "+types/Duration"
import { beforeEach, describe, expect, it } from "vitest"

describe("given a project of 4 files where 2 files have status 'passed' and 2 files have status 'running'", () => {
	const initialProject = dummyProject({
		files: [
			dummyFile("15b021ef72", { duration: 10, status: "running" }),
			dummyFile("a3fdd8b6c3", { duration: 20, status: "passed" }),
			dummyFile("-1730f876b4", { duration: 40, status: "running" }),
			dummyFile("-e45b128829", { duration: 80, status: "passed" }),
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
			expect(actualProject.files.map((file) => file.filename)).toEqual([
				"Bananas.tests.ts",
				"Peaches.tests.ts",
			])
		})

		it("refreshes the project duration based on the remaining files", () => {
			expect(actualProject.duration).toBe(initialProjectDuration - 10 - 40)
		})

		it("refreshes the project status based on the remaining files", () => {
			expect(actualProject.status).toBe<ProjectStatus>("passed")
		})
	})
})
