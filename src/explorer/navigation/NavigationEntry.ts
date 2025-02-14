import { toSum } from "+utilities/Arrays"
import type {
	TestCase,
	TestModule,
	TestModuleState,
	TestState,
	TestSuite,
	TestSuiteState,
	Vitest,
} from "vitest/node"

export type NavigationEntry = {
	id: string
	name: string
	status: NavigationEntryStatus
	durationMs: number | null
	children: NavigationEntries
}

export type NavigationEntryStatus =
	| "commenced"
	| "failed"
	| "passed"
	| "skipped"

export type NavigationEntries = Array<NavigationEntry>

export function isCommenced(
	entry: NavigationEntry,
): entry is NavigationEntry & { status: "commenced" } {
	return entry.status === "commenced"
}

export function isFailed(
	entry: NavigationEntry,
): entry is NavigationEntry & { status: "failed" } {
	return entry.status === "failed"
}

export function isPassed(
	entry: NavigationEntry,
): entry is NavigationEntry & { status: "passed" } {
	return entry.status === "passed"
}

export function isSkipped(
	entry: NavigationEntry,
): entry is NavigationEntry & { status: "skipped" } {
	return entry.status === "skipped"
}

export function mapVitestStateToNavigationEntries(
	vitest: Vitest,
): NavigationEntries {
	return vitest.state.getTestModules().map(mapModuleToNavigationEntry)
}

export function mapModuleToNavigationEntry(
	module: TestModule,
): NavigationEntry {
	return {
		id: module.id,
		name: module.moduleId,
		status: mapModuleStatus(module.state()),
		durationMs: module.diagnostic().duration,
		children: module.children.array().map(mapSuiteOrTestToNavigationEntry),
	}
}

const moduleStatusMap: Record<TestModuleState, NavigationEntryStatus> = {
	failed: "failed",
	passed: "passed",
	pending: "commenced",
	queued: "commenced",
	skipped: "skipped",
}

export function mapModuleStatus(
	status: TestModuleState,
): NavigationEntryStatus {
	return moduleStatusMap[status]
}

export function mapSuiteOrTestToNavigationEntry(
	suiteOrTest: TestSuite | TestCase,
): NavigationEntry {
	return suiteOrTest.type === "suite"
		? mapSuiteToNavigationEntry(suiteOrTest)
		: mapTestToNavigationEntry(suiteOrTest)
}

export function mapSuiteToNavigationEntry(suite: TestSuite): NavigationEntry {
	return {
		id: suite.id,
		name: suite.name,
		status: mapSuiteStatus(suite.state()),
		durationMs: computeDurationSum(suite),
		children: suite.children.array().map(mapSuiteOrTestToNavigationEntry),
	}
}

const suiteStatusMap: Record<TestSuiteState, NavigationEntryStatus> = {
	failed: "failed",
	passed: "passed",
	pending: "commenced",
	skipped: "skipped",
}

export function mapSuiteStatus(status: TestSuiteState): NavigationEntryStatus {
	return suiteStatusMap[status]
}

export function mapTestToNavigationEntry(test: TestCase): NavigationEntry {
	return {
		id: test.id,
		name: test.name,
		status: mapTestStatus(test.result().state),
		durationMs: test.diagnostic()?.duration ?? null,
		children: [],
	}
}

const testStatusMap: Record<TestState, NavigationEntryStatus> = {
	failed: "failed",
	passed: "passed",
	pending: "commenced",
	skipped: "skipped",
}

export function mapTestStatus(status: TestState): NavigationEntryStatus {
	return testStatusMap[status]
}

function computeDurationSum(suiteOrTest: TestSuite | TestCase): number {
	return suiteOrTest.type === "suite"
		? suiteOrTest.children.array().map(computeDurationSum).reduce(toSum)
		: (suiteOrTest.diagnostic()?.duration ?? 0)
}

export function withoutPath(entry: NavigationEntry): NavigationEntry {
	return { ...entry, name: entry.name.slice(entry.name.lastIndexOf("/") + 1) }
}
