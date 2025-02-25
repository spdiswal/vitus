import { type Suite, type SuiteId, newSuite } from "+models/Suite"
import type { TestModule, TestSuite, TestSuiteState } from "vitest/node"

export function dummySuite(
	id: keyof typeof dummySuites,
	overrides?: Partial<Suite>,
): Suite {
	return newSuite({ ...dummySuites[id], ...overrides })
}

const dummySuites = {
	"15b021ef72_10": newSuite({
		name: "when the fruit basket has no apples",
		path: ["15b021ef72", "15b021ef72_10"],
		status: "passed",
	}),
	"15b021ef72_11": newSuite({
		name: "when the spring break is over",
		path: ["15b021ef72", "15b021ef72_11"],
		status: "passed",
	}),
	"15b021ef72_12": newSuite({
		name: "when the music starts playing",
		path: ["15b021ef72", "15b021ef72_12"],
		status: "passed",
	}),
	a3fdd8b6c3_10: newSuite({
		name: "when the fruit basket has no bananas",
		path: ["a3fdd8b6c3", "a3fdd8b6c3_10"],
		status: "passed",
	}),
	a3fdd8b6c3_11: newSuite({
		name: "when the summer break is over",
		path: ["a3fdd8b6c3", "a3fdd8b6c3_11"],
		status: "passed",
	}),
	a3fdd8b6c3_12: newSuite({
		name: "when the music stops playing",
		path: ["a3fdd8b6c3", "a3fdd8b6c3_12"],
		status: "passed",
	}),
	"-1730f876b4_10": newSuite({
		name: "when the fruit basket has no oranges",
		path: ["-1730f876b4", "-1730f876b4_10"],
		status: "passed",
	}),
	"-1730f876b4_11": newSuite({
		name: "when the autumn break is over",
		path: ["-1730f876b4", "-1730f876b4_11"],
		status: "passed",
	}),
	"-1730f876b4_12": newSuite({
		name: "when the movie starts playing",
		path: ["-1730f876b4", "-1730f876b4_12"],
		status: "passed",
	}),
	"-e45b128829_10": newSuite({
		name: "when the fruit basket has no peaches",
		path: ["-e45b128829", "-e45b128829_10"],
		status: "passed",
	}),
	"-e45b128829_11": newSuite({
		name: "when the winter break is over",
		path: ["-e45b128829", "-e45b128829_11"],
		status: "passed",
	}),
	"-e45b128829_12": newSuite({
		name: "when the movie stops playing",
		path: ["-e45b128829", "-e45b128829_12"],
		status: "passed",
	}),
} as const satisfies Record<SuiteId, Suite>

export function fakeVitestSuite(props: {
	parentModule: TestModule
	parentSuite: TestSuite | null
	id: string
	name: string
	status: TestSuiteState
}): TestSuite {
	return {
		type: "suite",
		module: props.parentModule,
		parent: props.parentSuite ?? props.parentModule,
		id: props.id,
		name: props.name,
		state: () => props.status,
	} as TestSuite
}
