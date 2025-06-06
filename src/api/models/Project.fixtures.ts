import type { Module } from "+api/models/Module"
import { type DummyModuleId, dummyModule } from "+api/models/Module.fixtures"
import type { Project } from "+api/models/Project"
import type { Suite } from "+api/models/Suite"
import { type DummySuiteId, dummySuite } from "+api/models/Suite.fixtures"
import { failed, passed, skipped, started } from "+api/models/TaskStatus"
import type { Test } from "+api/models/Test"
import { type DummyTestId, dummyTest } from "+api/models/Test.fixtures"

type DummyProject = Omit<Project, "modulesById" | "subtasksById"> & {
	modulesById: Record<DummyModuleId, Partial<Module>>
	subtasksById: Record<DummySuiteId, Partial<Suite>> &
		Record<DummyTestId, Partial<Test>>
}

export function dummyProject(overrides: Partial<DummyProject> = {}): Project {
	const { modulesById, subtasksById, ...remainingOverrides } = overrides

	return {
		rootPath: "/Users/spdiswal/repositories/plantations/",
		status: "started",
		modulesById: {
			"15b021ef72": dummyModule("15b021ef72", {
				status: started(),
				...modulesById?.["15b021ef72"],
			}),
			"3afdd8b6c3": dummyModule("3afdd8b6c3", {
				status: passed(42),
				...modulesById?.["3afdd8b6c3"],
			}),
			"-1730f876b4": dummyModule("-1730f876b4", {
				status: failed(17),
				...modulesById?.["-1730f876b4"],
			}),
			"-e45b128829": dummyModule("-e45b128829", {
				status: started(),
				...modulesById?.["-e45b128829"],
			}),
		},
		subtasksById: {
			"15b021ef72_0": dummySuite("15b021ef72_0", {
				status: failed(1),
				...subtasksById?.["15b021ef72_0"],
			}),
			"15b021ef72_0_1": dummyTest("15b021ef72_0_1", {
				status: failed(1),
				...subtasksById?.["15b021ef72_0_1"],
			}),
			"15b021ef72_1": dummyTest("15b021ef72_1", {
				status: started(),
				...subtasksById?.["15b021ef72_1"],
			}),
			"15b021ef72_2": dummySuite("15b021ef72_2", {
				status: passed(2),
				...subtasksById?.["15b021ef72_2"],
			}),
			"15b021ef72_2_3": dummyTest("15b021ef72_2_3", {
				status: skipped(),
				...subtasksById?.["15b021ef72_2_3"],
			}),
			"15b021ef72_2_6": dummySuite("15b021ef72_2_6", {
				status: started(),
				...subtasksById?.["15b021ef72_2_6"],
			}),
			"15b021ef72_2_6_7": dummyTest("15b021ef72_2_6_7", {
				status: passed(2),
				...subtasksById?.["15b021ef72_2_6_7"],
			}),
			"15b021ef72_2_6_9": dummyTest("15b021ef72_2_6_9", {
				status: started(),
				...subtasksById?.["15b021ef72_2_6_9"],
			}),
			//
			"3afdd8b6c3_0": dummySuite("3afdd8b6c3_0", {
				status: started(),
				...subtasksById?.["3afdd8b6c3_0"],
			}),
			"3afdd8b6c3_0_1": dummyTest("3afdd8b6c3_0_1", {
				status: started(),
				...subtasksById?.["3afdd8b6c3_0_1"],
			}),
			"3afdd8b6c3_0_3": dummyTest("3afdd8b6c3_0_3", {
				status: failed(7),
				...subtasksById?.["3afdd8b6c3_0_3"],
			}),
			"3afdd8b6c3_1": dummyTest("3afdd8b6c3_1", {
				status: started(),
				...subtasksById?.["3afdd8b6c3_1"],
			}),
			"3afdd8b6c3_2": dummySuite("3afdd8b6c3_2", {
				status: skipped(),
				...subtasksById?.["3afdd8b6c3_2"],
			}),
			"3afdd8b6c3_2_5": dummyTest("3afdd8b6c3_2_5", {
				status: failed(8),
				...subtasksById?.["3afdd8b6c3_2_5"],
			}),
			"3afdd8b6c3_2_6": dummySuite("3afdd8b6c3_2_6", {
				status: failed(7),
				...subtasksById?.["3afdd8b6c3_2_6"],
			}),
			"3afdd8b6c3_2_6_7": dummyTest("3afdd8b6c3_2_6_7", {
				status: started(),
				...subtasksById?.["3afdd8b6c3_2_6_7"],
			}),
			"3afdd8b6c3_2_6_9": dummyTest("3afdd8b6c3_2_6_9", {
				status: passed(7),
				...subtasksById?.["3afdd8b6c3_2_6_9"],
			}),
			"3afdd8b6c3_2_8": dummySuite("3afdd8b6c3_2_8", {
				status: started(),
				...subtasksById?.["3afdd8b6c3_2_8"],
			}),
			"3afdd8b6c3_2_8_1": dummyTest("3afdd8b6c3_2_8_1", {
				status: started(),
				...subtasksById?.["3afdd8b6c3_2_8_1"],
			}),
			"3afdd8b6c3_2_8_3": dummyTest("3afdd8b6c3_2_8_3", {
				status: skipped(),
				...subtasksById?.["3afdd8b6c3_2_8_3"],
			}),
			"3afdd8b6c3_2_8_4": dummySuite("3afdd8b6c3_2_8_4", {
				status: passed(0),
				...subtasksById?.["3afdd8b6c3_2_8_4"],
			}),
			"3afdd8b6c3_2_8_4_1": dummyTest("3afdd8b6c3_2_8_4_1", {
				status: started(),
				...subtasksById?.["3afdd8b6c3_2_8_4_1"],
			}),
			"3afdd8b6c3_3": dummyTest("3afdd8b6c3_3", {
				status: failed(14),
				...subtasksById?.["3afdd8b6c3_3"],
			}),
			"3afdd8b6c3_4": dummySuite("3afdd8b6c3_4", {
				status: skipped(),
				...subtasksById?.["3afdd8b6c3_4"],
			}),
			"3afdd8b6c3_4_5": dummyTest("3afdd8b6c3_4_5", {
				status: started(),
				...subtasksById?.["3afdd8b6c3_4_5"],
			}),
			//
			"-1730f876b4_0": dummySuite("-1730f876b4_0", {
				status: passed(0),
				...subtasksById?.["-1730f876b4_0"],
			}),
			"-1730f876b4_0_1": dummyTest("-1730f876b4_0_1", {
				status: started(),
				...subtasksById?.["-1730f876b4_0_1"],
			}),
			"-1730f876b4_0_3": dummyTest("-1730f876b4_0_3", {
				status: skipped(),
				...subtasksById?.["-1730f876b4_0_3"],
			}),
			"-1730f876b4_0_4": dummySuite("-1730f876b4_0_4", {
				status: started(),
				...subtasksById?.["-1730f876b4_0_4"],
			}),
			"-1730f876b4_0_4_5": dummyTest("-1730f876b4_0_4_5", {
				status: started(),
				...subtasksById?.["-1730f876b4_0_4_5"],
			}),
			"-1730f876b4_7": dummyTest("-1730f876b4_7", {
				status: skipped(),
				...subtasksById?.["-1730f876b4_7"],
			}),
			"-1730f876b4_9": dummyTest("-1730f876b4_9", {
				status: started(),
				...subtasksById?.["-1730f876b4_9"],
			}),
			//
			"-e45b128829_2": dummySuite("-e45b128829_2", {
				status: failed(0),
				...subtasksById?.["-e45b128829_2"],
			}),
			"-e45b128829_2_1": dummyTest("-e45b128829_2_1", {
				status: started(),
				...subtasksById?.["-e45b128829_2_1"],
			}),
			"-e45b128829_4": dummySuite("-e45b128829_4", {
				status: passed(21),
				...subtasksById?.["-e45b128829_4"],
			}),
			"-e45b128829_4_4": dummySuite("-e45b128829_4_4", {
				status: started(),
				...subtasksById?.["-e45b128829_4_4"],
			}),
			"-e45b128829_4_4_3": dummyTest("-e45b128829_4_4_3", {
				status: passed(15),
				...subtasksById?.["-e45b128829_4_4_3"],
			}),
			"-e45b128829_4_4_6": dummySuite("-e45b128829_4_4_6", {
				status: skipped(),
				...subtasksById?.["-e45b128829_4_4_6"],
			}),
			"-e45b128829_4_4_6_5": dummyTest("-e45b128829_4_4_6_5", {
				status: passed(6),
				...subtasksById?.["-e45b128829_4_4_6_5"],
			}),
		},
		...remainingOverrides,
	}
}
