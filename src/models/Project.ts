import {
	type Module,
	type ModuleId,
	type Modules,
	countModuleChildren,
	getModuleChildIds,
	getTopLevelSuiteById,
	getTopLevelTestById,
	hasModuleStatus,
	mapVitestToModule,
	putTopLevelSuiteOrTest,
} from "+models/Module"
import type { DummyModuleId } from "+models/Module.fixtures"
import {
	type Suite,
	type SuiteIds,
	getDeeplyNestedSuiteByPath,
	getNestedTestById,
	hasNestedSuites,
	putDeeplyNestedSuiteOrTest,
	putNestedSuiteOrTest,
} from "+models/Suite"
import { type DummySuiteId, getDummySuitePath } from "+models/Suite.fixtures"
import type { SuitePath } from "+models/SuitePath"
import type { Test, TestId } from "+models/Test"
import type { TestPath } from "+models/TestPath"
import type { Comparator } from "+types/Comparator"
import type { Computed, PickNonComputed } from "+types/Computed"
import type { Path } from "+types/Path"
import { assertNotNullish } from "+utilities/Assertions"
import { count } from "+utilities/Strings"
import type { Vitest } from "vitest/node"

export type Project = {
	modules: Modules
	isConnected: boolean
	rootPath: Path
	status: Computed<ProjectStatus>
}

export type ProjectStatus = "failed" | "passed" | "running"

const byFilename: Comparator<Module> = (a, b) =>
	a.filename.localeCompare(b.filename)

export function newProject(props: PickNonComputed<Project>): Project {
	const modules = props.modules.toSorted(byFilename)

	return {
		...props,
		modules,
		status: modules.some(hasModuleStatus("running"))
			? "running"
			: modules.some(hasModuleStatus("failed"))
				? "failed"
				: "passed",
	}
}

export function getModuleById(
	project: Project,
	moduleId: ModuleId,
): Module | null {
	return project.modules.find((module) => module.id === moduleId) ?? null
}

export function getOtherModules(
	project: Project,
	excludedModuleId: ModuleId,
): Modules {
	return project.modules.filter((module) => module.id !== excludedModuleId)
}

export function getModuleByPath(project: Project, path: Path): Module | null {
	return project.modules.find((module) => module.path === path) ?? null
}

export function getProjectChildIds(project: Project): Array<string> {
	return project.modules.flatMap((module) => [
		module.id,
		...getModuleChildIds(module),
	])
}

export function putModule(project: Project, moduleToInsert: Module): Project {
	const existingModuleIndex = project.modules.findIndex(
		(module) => module.id === moduleToInsert.id,
	)

	const modules: Modules =
		existingModuleIndex === -1
			? [...project.modules, moduleToInsert]
			: project.modules.with(existingModuleIndex, moduleToInsert)

	return newProject({ ...project, modules })
}

export function getSuiteByPath(
	project: Project,
	suitePath: SuitePath,
): Suite | null {
	const [moduleId, topLevelSuiteId, ...remainingPath] = suitePath

	const parentModule = getModuleById(project, moduleId)

	if (parentModule === null) {
		return null
	}

	const topLevelSuite = getTopLevelSuiteById(parentModule, topLevelSuiteId)

	return !hasNestedSuites(remainingPath) || topLevelSuite === null
		? topLevelSuite
		: getDeeplyNestedSuiteByPath(topLevelSuite, remainingPath)
}

export function putSuite(project: Project, suiteToInsert: Suite): Project {
	const [moduleId, topLevelSuiteId, ...remainingPath] = suiteToInsert.path

	const parentModule = getModuleById(project, moduleId)

	if (parentModule === null) {
		return project
	}
	if (!hasNestedSuites(remainingPath)) {
		const updatedModule = putTopLevelSuiteOrTest(parentModule, suiteToInsert)
		return putModule(project, updatedModule)
	}

	const topLevelSuite = getTopLevelSuiteById(parentModule, topLevelSuiteId)

	if (topLevelSuite === null) {
		return project
	}

	const updatedTopLevelSuite = putDeeplyNestedSuiteOrTest(
		topLevelSuite,
		remainingPath,
		suiteToInsert,
	)

	const updatedModule = putTopLevelSuiteOrTest(
		parentModule,
		updatedTopLevelSuite,
	)
	return putModule(project, updatedModule)
}

export function getTestByPath(
	project: Project,
	testPath: TestPath,
): Test | null {
	const [moduleId, ...suiteAndTestIds] = testPath
	const testId = suiteAndTestIds.pop() as TestId
	const suiteIds = suiteAndTestIds as SuiteIds

	const parentModule = getModuleById(project, moduleId)

	if (parentModule === null) {
		return null
	}
	if (!hasNestedSuites(suiteIds)) {
		return getTopLevelTestById(parentModule, testId)
	}

	const [topLevelSuiteId, ...remainingPath] = suiteIds

	const topLevelSuite = getTopLevelSuiteById(parentModule, topLevelSuiteId)
	const parentSuite =
		!hasNestedSuites(remainingPath) || topLevelSuite === null
			? topLevelSuite
			: getDeeplyNestedSuiteByPath(topLevelSuite, remainingPath)

	if (parentSuite === null) {
		return null
	}

	return getNestedTestById(parentSuite, testId)
}

export function putTest(project: Project, testToInsert: Test): Project {
	const [moduleId, ...suiteAndTestIds] = testToInsert.path
	suiteAndTestIds.pop()
	const suiteIds = suiteAndTestIds as SuiteIds

	const parentModule = getModuleById(project, moduleId)

	if (parentModule === null) {
		return project
	}
	if (!hasNestedSuites(suiteIds)) {
		const updatedModule = putTopLevelSuiteOrTest(parentModule, testToInsert)
		return putModule(project, updatedModule)
	}

	const [topLevelSuiteId, ...remainingPath] = suiteIds
	const topLevelSuite = getTopLevelSuiteById(parentModule, topLevelSuiteId)

	if (topLevelSuite === null) {
		return project
	}

	const updatedTopLevelSuite = hasNestedSuites(remainingPath)
		? putDeeplyNestedSuiteOrTest(topLevelSuite, remainingPath, testToInsert)
		: putNestedSuiteOrTest(topLevelSuite, testToInsert)

	const updatedModule = putTopLevelSuiteOrTest(
		parentModule,
		updatedTopLevelSuite,
	)
	return putModule(project, updatedModule)
}

export function assertDummyProject(
	project: Project,
	expectations: { status: ProjectStatus },
): void {
	const actualStatus = project.status
	const expectedStatus = expectations.status

	if (actualStatus !== expectedStatus) {
		throw new Error(
			`Expected the project to have status '${expectedStatus}', but was '${actualStatus}'`,
		)
	}
}

export function assertDummyModules(
	project: Project,
	expectations: Partial<Record<DummyModuleId, { totalChildCount: number }>>,
): void {
	for (const [moduleId, moduleExpectations] of Object.entries(expectations)) {
		const module = getModuleById(project, moduleId as DummyModuleId)
		assertNotNullish(module)

		const actualChildCount = countModuleChildren(module)
		const expectedChildCount = moduleExpectations.totalChildCount

		if (actualChildCount !== expectedChildCount) {
			throw new Error(
				`Expected the module '${moduleId}' to have ${count(expectedChildCount, "child", "children")}, but got ${count(actualChildCount, "child", "children")}: ${getModuleChildIds(module).join(", ")}`,
			)
		}
	}
}

export function assertDummySuites(
	project: Project,
	expectations: Partial<Record<DummySuiteId, Record<string, never>>>,
): void {
	for (const [suiteId] of Object.entries(expectations)) {
		const path = getDummySuitePath(suiteId as DummySuiteId)
		const suite = getSuiteByPath(project, path)
		assertNotNullish(suite)
	}
}

export function mapVitestToProject(vitest: Vitest): Project {
	return newProject({
		modules: vitest.state.getTestModules().map(mapVitestToModule),
		isConnected: true,
		rootPath: vitest.config.root,
	})
}
