import { dummyModuleDto } from "+api/models/ModuleDto.fixtures"
import type { StateDto } from "+api/models/StateDto"
import { dummySuiteDto } from "+api/models/SuiteDto.fixtures"
import { dummyTestDto } from "+api/models/TestDto.fixtures"

export const dummyProjectRootPath = "/Users/spdiswal/repositories/plantations/"

export function dummyStateDto(): StateDto {
	return {
		rootPath: dummyProjectRootPath,
		rootStatus: "disconnected",
		modules: [
			dummyModuleDto("15b021ef72", { duration: 10, status: "started" }),
			dummyModuleDto("a3fdd8b6c3", { duration: 20, status: "passed" }),
			dummyModuleDto("-1730f876b4", { duration: 40, status: "passed" }),
			dummyModuleDto("-e45b128829", { duration: 80, status: "started" }),
		],
		subtasks: [
			dummySuiteDto("15b021ef72_0", { status: "failed" }),
			dummyTestDto("15b021ef72_0_1", { status: "failed" }),
			dummyTestDto("15b021ef72_1", { status: "started" }),
			dummySuiteDto("15b021ef72_2", { status: "passed" }),
			dummyTestDto("15b021ef72_2_3", { status: "skipped" }),
			dummySuiteDto("15b021ef72_2_6", { status: "started" }),
			dummyTestDto("15b021ef72_2_6_7", { status: "passed" }),
			dummyTestDto("15b021ef72_2_6_9", { status: "started" }),
			//
			dummySuiteDto("a3fdd8b6c3_0", { status: "started" }),
			dummyTestDto("a3fdd8b6c3_0_1", { status: "started" }),
			dummyTestDto("a3fdd8b6c3_0_3", { status: "failed" }),
			dummyTestDto("a3fdd8b6c3_1", { status: "started" }),
			dummySuiteDto("a3fdd8b6c3_2", { status: "skipped" }),
			dummyTestDto("a3fdd8b6c3_2_5", { status: "failed" }),
			dummySuiteDto("a3fdd8b6c3_2_6", { status: "failed" }),
			dummyTestDto("a3fdd8b6c3_2_6_7", { status: "started" }),
			dummyTestDto("a3fdd8b6c3_2_6_9", { status: "passed" }),
			dummySuiteDto("a3fdd8b6c3_2_8", { status: "started" }),
			dummyTestDto("a3fdd8b6c3_2_8_1", { status: "started" }),
			dummyTestDto("a3fdd8b6c3_2_8_3", { status: "skipped" }),
			dummySuiteDto("a3fdd8b6c3_2_8_4", { status: "passed" }),
			dummyTestDto("a3fdd8b6c3_2_8_4_1", { status: "started" }),
			dummyTestDto("a3fdd8b6c3_3", { status: "failed" }),
			dummySuiteDto("a3fdd8b6c3_4", { status: "skipped" }),
			dummyTestDto("a3fdd8b6c3_4_5", { status: "started" }),
			//
			dummySuiteDto("-1730f876b4_0", { status: "passed" }),
			dummyTestDto("-1730f876b4_0_1", { status: "started" }),
			dummyTestDto("-1730f876b4_0_3", { status: "skipped" }),
			dummySuiteDto("-1730f876b4_0_4", { status: "started" }),
			dummyTestDto("-1730f876b4_0_4_5", { status: "started" }),
			dummyTestDto("-1730f876b4_7", { status: "skipped" }),
			dummyTestDto("-1730f876b4_9", { status: "started" }),
			//
			dummySuiteDto("-e45b128829_2", { status: "failed" }),
			dummyTestDto("-e45b128829_2_1", { status: "started" }),
			dummySuiteDto("-e45b128829_4", { status: "passed" }),
			dummySuiteDto("-e45b128829_4_4", { status: "started" }),
			dummyTestDto("-e45b128829_4_4_3", { status: "passed" }),
			dummySuiteDto("-e45b128829_4_4_6", { status: "skipped" }),
			dummyTestDto("-e45b128829_4_4_6_5", { status: "passed" }),
		],
	}
}
