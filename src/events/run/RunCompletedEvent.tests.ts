import { applyProjectEvent } from "+events/ProjectEvent"
import { runCompletedEvent } from "+events/run/RunCompletedEvent"
import { dummyModule } from "+models/Module.fixtures"
import {
	type Project,
	type ProjectStatus,
	assertDummyModules,
	assertDummyProject,
	getProjectChildIds,
} from "+models/Project"
import { type DummyIds, dummyProject } from "+models/Project.fixtures"
import { dummySuite } from "+models/Suite.fixtures"
import { dummyTest } from "+models/Test.fixtures"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

const initialProject = dummyProject({}, [
	dummyModule("15b021ef72", { status: "passed" }, [
		dummySuite("15b021ef72_0", { status: "failed" }, [
			dummyTest("15b021ef72_0_1", { status: "failed" }),
		]),
		dummyTest("15b021ef72_1", { status: "running" }),
		dummySuite("15b021ef72_2", { status: "passed" }, [
			dummyTest("15b021ef72_2_3", { status: "skipped" }),
			dummySuite("15b021ef72_2_6", { status: "running" }, [
				dummyTest("15b021ef72_2_6_7", { status: "passed" }),
				dummyTest("15b021ef72_2_6_9", { status: "running" }),
			]),
		]),
	]),
	dummyModule("a3fdd8b6c3", { status: "running" }, [
		dummySuite("a3fdd8b6c3_0", { status: "running" }, [
			dummyTest("a3fdd8b6c3_0_1", { status: "running" }),
			dummyTest("a3fdd8b6c3_0_3", { status: "failed" }),
		]),
		dummyTest("a3fdd8b6c3_1", { status: "running" }),
		dummySuite("a3fdd8b6c3_2", { status: "skipped" }, [
			dummyTest("a3fdd8b6c3_2_5", { status: "failed" }),
			dummySuite("a3fdd8b6c3_2_6", { status: "failed" }, [
				dummyTest("a3fdd8b6c3_2_6_7", { status: "running" }),
				dummyTest("a3fdd8b6c3_2_6_9", { status: "passed" }),
			]),
			dummySuite("a3fdd8b6c3_2_8", { status: "running" }, [
				dummyTest("a3fdd8b6c3_2_8_1", { status: "running" }),
				dummyTest("a3fdd8b6c3_2_8_3", { status: "skipped" }),
				dummySuite("a3fdd8b6c3_2_8_4", { status: "passed" }, [
					dummyTest("a3fdd8b6c3_2_8_4_1", { status: "running" }),
				]),
			]),
		]),
		dummyTest("a3fdd8b6c3_3", { status: "failed" }),
		dummySuite("a3fdd8b6c3_4", { status: "skipped" }, [
			dummyTest("a3fdd8b6c3_4_5", { status: "running" }),
		]),
	]),
	dummyModule("-1730f876b4", { status: "passed" }, [
		dummySuite("-1730f876b4_0", { status: "passed" }, [
			dummyTest("-1730f876b4_0_1", { status: "running" }),
			dummyTest("-1730f876b4_0_3", { status: "skipped" }),
			dummySuite("-1730f876b4_0_4", { status: "running" }, [
				dummyTest("-1730f876b4_0_4_5", { status: "running" }),
			]),
		]),
		dummyTest("-1730f876b4_7", { status: "skipped" }),
		dummyTest("-1730f876b4_9", { status: "running" }),
	]),
	dummyModule("-e45b128829", { status: "failed" }, [
		dummySuite("-e45b128829_2", { status: "failed" }, [
			dummyTest("-e45b128829_2_1", { status: "running" }),
		]),
		dummySuite("-e45b128829_4", { status: "passed" }, [
			dummySuite("-e45b128829_4_4", { status: "running" }, [
				dummyTest("-e45b128829_4_4_3", { status: "passed" }),
				dummySuite("-e45b128829_4_4_6", { status: "running" }, [
					dummyTest("-e45b128829_4_4_6_5", { status: "skipped" }),
				]),
			]),
		]),
	]),
])

beforeAll(() => {
	assertDummyProject(initialProject, { status: "running" })
	assertDummyModules(initialProject, {
		"15b021ef72": { totalChildCount: 8 },
		a3fdd8b6c3: { totalChildCount: 17 },
		"-1730f876b4": { totalChildCount: 7 },
		"-e45b128829": { totalChildCount: 7 },
	})
})

describe("when the run has completed", () => {
	let actualProject: Project

	beforeEach(() => {
		actualProject = applyProjectEvent(initialProject, runCompletedEvent())
	})

	it("discards unfinished modules, suites, and tests", () => {
		expect(getProjectChildIds(actualProject)).toEqual<DummyIds>([
			"15b021ef72",
			"15b021ef72_0",
			"15b021ef72_0_1",
			"15b021ef72_2",
			"15b021ef72_2_3",
			"-1730f876b4",
			"-1730f876b4_0",
			"-1730f876b4_0_3",
			"-1730f876b4_7",
			"-e45b128829",
			"-e45b128829_2",
			"-e45b128829_4",
		])
	})

	it("updates the project status based on the latest set of modules", () => {
		expect(actualProject.status).toBe<ProjectStatus>("failed")
	})
})
