import { applyEvent } from "+events/Event"
import { serverRestartedEvent } from "+events/server/ServerRestartedEvent"
import { dummyFile } from "+models/File.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertProjectDuration,
	assertProjectFileCount,
	assertProjectStatus,
} from "+models/Project"
import { dummyProject } from "+models/Project.fixtures"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({
	files: [
		dummyFile("15b021ef72", { duration: 10, status: "failed" }),
		dummyFile("a3fdd8b6c3", { duration: 20, status: "passed" }),
		dummyFile("-1730f876b4", { duration: 40, status: "passed" }),
		dummyFile("-e45b128829", { duration: 80, status: "failed" }),
	],
})

beforeAll(() => {
	assertProjectDuration(initialProject, 10 + 20 + 40 + 80)
	assertProjectFileCount(initialProject, 4)
	assertProjectStatus(initialProject, "failed")
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
