import { type DummyFileId, dummyFile } from "+models/File.fixtures"
import type { SerialisableProject } from "+models/Project"
import { type DummySuiteId, dummySuite } from "+models/Suite.fixtures"
import { type DummyTestId, dummyTest } from "+models/Test.fixtures"

export type DummyIds = Array<DummyFileId | DummySuiteId | DummyTestId>

export const dummyProjectRootPath = "/Users/sdi/repositories/plantations/"

export function dummyProject(): SerialisableProject {
	return {
		rootPath: dummyProjectRootPath,
		status: "",
		filesById: [
			dummyFile("15b021ef72", { duration: 10, status: "running" }, [
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
			dummyFile("a3fdd8b6c3", { duration: 20, status: "passed" }, [
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
			dummyFile("-1730f876b4", { duration: 40, status: "passed" }, [
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
			dummyFile("-e45b128829", { duration: 80, status: "running" }, [
				dummySuite("-e45b128829_2", { status: "failed" }, [
					dummyTest("-e45b128829_2_1", { status: "running" }),
				]),
				dummySuite("-e45b128829_4", { status: "passed" }, [
					dummySuite("-e45b128829_4_4", { status: "running" }, [
						dummyTest("-e45b128829_4_4_3", { status: "passed" }),
						dummySuite("-e45b128829_4_4_6", { status: "skipped" }, [
							dummyTest("-e45b128829_4_4_6_5", { status: "passed" }),
						]),
					]),
				]),
			]),
		],
		subtasksById: [],
	}
}
