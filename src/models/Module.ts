import {
	type Suite,
	type SuiteId,
	countSuiteChildren,
	dropUnfinishedSuiteChildren,
	getSuiteChildIds,
	hasNotSuiteOrTestStatus,
	isSuite,
	mapVitestToSuiteOrTest,
} from "+models/Suite"
import { type Test, type TestId, isTest } from "+models/Test"
import type { Comparator } from "+types/Comparator"
import type { Computed, PickNonComputed } from "+types/Computed"
import { type Path, getFilenameFromPath } from "+types/Path"
import { toSum } from "+utilities/Arrays"
import type { TestModule, TestModuleState } from "vitest/node"

export type Module = {
	id: ModuleId
	filename: Computed<string>
	path: Path
	status: ModuleStatus
	suitesAndTests: Array<Suite | Test>
}

export type Modules = Array<Module>

export type ModuleId = string
export type ModuleIds = Array<ModuleId>
export type ModuleStatus = "failed" | "passed" | "running" | "skipped"

const bySuiteOrTestId: Comparator<Suite | Test> = (a, b) =>
	a.id.localeCompare(b.id, undefined, { numeric: true })

export function newModule(props: PickNonComputed<Module>): Module {
	return {
		...props,
		suitesAndTests: props.suitesAndTests.toSorted(bySuiteOrTestId),
		filename: getFilenameFromPath(props.path),
	}
}

export function hasModuleStatus(
	status: ModuleStatus,
): (module: Module) => boolean {
	return (module): boolean => module.status === status
}

export function hasNotModuleStatus(
	status: ModuleStatus,
): (module: Module) => boolean {
	return (module): boolean => module.status !== status
}

export function countModuleChildren(module: Module): number {
	return (
		module.suitesAndTests.length +
		module.suitesAndTests
			.filter(isSuite)
			.map(countSuiteChildren)
			.reduce(toSum, 0)
	)
}

export function getModuleChildIds(module: Module): Array<string> {
	return module.suitesAndTests.flatMap((suiteOrTest) =>
		isSuite(suiteOrTest)
			? [suiteOrTest.id, ...getSuiteChildIds(suiteOrTest)]
			: [suiteOrTest.id],
	)
}

export function getTopLevelSuiteById(
	parentModule: Module,
	suiteId: SuiteId,
): Suite | null {
	return (
		parentModule.suitesAndTests.find(
			(suiteOrTest): suiteOrTest is Suite =>
				suiteOrTest.id === suiteId && isSuite(suiteOrTest),
		) ?? null
	)
}

export function getTopLevelTestById(
	parentModule: Module,
	testId: TestId,
): Test | null {
	return (
		parentModule.suitesAndTests.find(
			(suiteOrTest): suiteOrTest is Test =>
				suiteOrTest.id === testId && isTest(suiteOrTest),
		) ?? null
	)
}

export function putTopLevelSuiteOrTest(
	parentModule: Module,
	suiteOrTestToInsert: Suite | Test,
): Module {
	const existingSuiteOrTestIndex = parentModule.suitesAndTests.findIndex(
		(suiteOrTest) => suiteOrTest.id === suiteOrTestToInsert.id,
	)

	const suitesAndTests: Array<Suite | Test> =
		existingSuiteOrTestIndex === -1
			? [...parentModule.suitesAndTests, suiteOrTestToInsert]
			: parentModule.suitesAndTests.with(
					existingSuiteOrTestIndex,
					suiteOrTestToInsert,
				)

	return newModule({ ...parentModule, suitesAndTests })
}

export function dropUnfinishedModuleChildren(module: Module): Module {
	return newModule({
		...module,
		suitesAndTests: module.suitesAndTests
			.filter(hasNotSuiteOrTestStatus("running"))
			.map((suiteOrTest) =>
				isSuite(suiteOrTest)
					? dropUnfinishedSuiteChildren(suiteOrTest)
					: suiteOrTest,
			),
	})
}

const statusMap: Record<TestModuleState, ModuleStatus> = {
	failed: "failed",
	passed: "passed",
	pending: "running",
	queued: "running",
	skipped: "skipped",
}

export function mapVitestToModule(module: TestModule): Module {
	return newModule({
		id: module.id,
		path: module.moduleId,
		status: statusMap[module.state()],
		suitesAndTests: module.children.array().map(mapVitestToSuiteOrTest),
	})
}
