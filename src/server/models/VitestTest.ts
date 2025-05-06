import { getTaskStatusFromVitest } from "+api/models/TaskStatus"
import type { Test } from "+api/models/Test"
import type { VitestModule } from "+server/models/VitestModule"
import type { VitestSuite } from "+server/models/VitestSuite"
import type { TestCase, TestState } from "vitest/node"

/**
 * A subset of {@link TestCase} that is easier to mock in unit tests.
 */
export type VitestTest = Pick<
	TestCase,
	"diagnostic" | "id" | "module" | "name" | "result" | "type"
> & { parent: VitestModule | VitestSuite }

export type VitestTestDiagnostic = ReturnType<VitestTest["diagnostic"]>

export function newTestFromVitest(
	test: VitestTest,
	overrides?: { status?: TestState },
): Test {
	return {
		type: "test",
		id: test.id,
		parentId: test.parent.id,
		parentModuleId: test.module.id,
		name: test.name,
		status: getTaskStatusFromVitest(
			overrides?.status ?? test.result().state,
			test.diagnostic()?.duration,
		),
	}
}
