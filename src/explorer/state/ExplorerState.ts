import {
	type NavigationEntries,
	isCommenced,
	isFailed,
	isPassed,
	mapVitestStateToNavigationEntries,
} from "+explorer/navigation/NavigationEntry"
import type { Vitest } from "vitest/node"

export type ExplorerState = {
	navigationEntries: NavigationEntries
	overallStatus: ExplorerOverallStatus
}

export type ExplorerOverallStatus =
	| "commenced"
	| "disconnected"
	| "failed"
	| "passed"
	| "skipped"

export function getInitialState(vitest: Vitest): ExplorerState {
	const navigationEntries = mapVitestStateToNavigationEntries(vitest)

	return {
		navigationEntries,
		overallStatus: mapNavigationEntriesToOverallStatus(navigationEntries),
	}
}

export function mapNavigationEntriesToOverallStatus(
	navigationEntries: NavigationEntries,
): ExplorerOverallStatus {
	if (navigationEntries.some(isCommenced)) {
		return "commenced"
	}
	if (navigationEntries.some(isFailed)) {
		return "failed"
	}
	if (navigationEntries.some(isPassed)) {
		return "passed"
	}
	return "skipped"
}
