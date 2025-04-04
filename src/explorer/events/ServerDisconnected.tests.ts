import { applyProjectEvent } from "+events/ProjectEvent"
import { serverDisconnectedEvent } from "+events/server/ServerDisconnectedEvent"
import type { GlobalStatus } from "+models/GlobalStatus"
import type { Project } from "+models/Project"
import {
	dummyProjectRootPath,
	newDummyProject,
	unwrapProject,
} from "+models/Project.fixtures"
import type { UnwrapSignals } from "+utilities/Signals"
import { beforeAll, describe, expect, it } from "vitest"

describe("when the server has disconnected", () => {
	let project: UnwrapSignals<Project>

	beforeAll(() => {
		const event = serverDisconnectedEvent()
		project = unwrapProject(applyProjectEvent(newDummyProject(), event))
	})

	it("is no longer connected", () => {
		expect(project.isConnected).toBe(false)
	})

	it("does not change the project root path", () => {
		expect(project.rootPath).toBe(dummyProjectRootPath)
	})

	// it("discards unfinished files, suites, and tests", () => {
	// 	expect(getProjectChildIds(project)).toEqual<DummyIds>([
	// 		"a3fdd8b6c3",
	// 		"a3fdd8b6c3_2",
	// 		"a3fdd8b6c3_2_5",
	// 		"a3fdd8b6c3_2_6",
	// 		"a3fdd8b6c3_2_6_9",
	// 		"a3fdd8b6c3_3",
	// 		"a3fdd8b6c3_4",
	// 		"-1730f876b4",
	// 		"-1730f876b4_0",
	// 		"-1730f876b4_0_3",
	// 		"-1730f876b4_7",
	// 	])
	// })

	it("updates the project duration based on the latest fileset", () => {
		expect(project.duration).toBe(20 + 40)
	})

	it("updates the project status based on the latest fileset", () => {
		expect(project.status).toBe<GlobalStatus>("passed")
	})
})
