import type { Module } from "+api/models/Module"
import { getTaskStatusFromVitest } from "+api/models/TaskStatus"
import type { VitestSuite } from "+server/models/VitestSuite"
import type { VitestTest } from "+server/models/VitestTest"
import { getFilenameFromPath } from "+types/Path"
import type { TestModule, TestModuleState } from "vitest/node"

/**
 * A subset of {@link TestModule} that is easier to mock in unit tests.
 */
export type VitestModule = Pick<
	TestModule,
	"diagnostic" | "id" | "moduleId" | "state" | "type"
> & {
	children: {
		allSuites: () => Iterable<VitestSuite>
		allTests: () => Iterable<VitestTest>
	}
}

export type VitestModuleDiagnostic = ReturnType<VitestModule["diagnostic"]>

export function newModuleFromVitest(
	module: VitestModule,
	overrides?: { status?: TestModuleState },
): Module {
	return {
		type: "module",
		id: module.id,
		path: module.moduleId,
		filename: getFilenameFromPath(module.moduleId),
		status: getTaskStatusFromVitest(
			overrides?.status ?? module.state(),
			module.diagnostic().duration,
		),
	}
}
