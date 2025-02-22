import { type Test, type TestId, newTest } from "+models/Test"
import type {
	TestCase,
	TestModule,
	TestResult,
	TestState,
	TestSuite,
} from "vitest/node"

export function dummyTest(
	id: keyof typeof dummyTests,
	overrides?: Partial<Test>,
): Test {
	return newTest({ ...dummyTests[id], ...overrides })
}

const dummyTests = {
	"15b021ef72_50": newTest({
		duration: 0,
		name: "drinks the apple juice",
		path: ["15b021ef72", "15b021ef72_50"],
		status: "passed",
	}),
	"15b021ef72_51": newTest({
		duration: 0,
		name: "changes the batteries",
		path: ["15b021ef72", "15b021ef72_51"],
		status: "passed",
	}),
	"15b021ef72_52": newTest({
		duration: 0,
		name: "refills the basket with fresh apples",
		path: ["15b021ef72", "15b021ef72_52"],
		status: "passed",
	}),
	a3fdd8b6c3_50: newTest({
		duration: 0,
		name: "drinks the milkshake",
		path: ["a3fdd8b6c3", "a3fdd8b6c3_50"],
		status: "passed",
	}),
	a3fdd8b6c3_51: newTest({
		duration: 0,
		name: "recharges the smartphone",
		path: ["a3fdd8b6c3", "a3fdd8b6c3_51"],
		status: "passed",
	}),
	a3fdd8b6c3_52: newTest({
		duration: 0,
		name: "refills the basket with fresh bananas",
		path: ["a3fdd8b6c3", "a3fdd8b6c3_52"],
		status: "passed",
	}),
	"-1730f876b4_50": newTest({
		duration: 0,
		name: "drinks the orange juice",
		path: ["-1730f876b4", "-1730f876b4_50"],
		status: "passed",
	}),
	"-1730f876b4_51": newTest({
		duration: 0,
		name: "plugs in the power cord",
		path: ["-1730f876b4", "-1730f876b4_51"],
		status: "passed",
	}),
	"-1730f876b4_52": newTest({
		duration: 0,
		name: "refills the basket with fresh oranges",
		path: ["-1730f876b4", "-1730f876b4_52"],
		status: "passed",
	}),
	"-e45b128829_50": newTest({
		duration: 0,
		name: "drinks the hot chocolate",
		path: ["-e45b128829", "-e45b128829_50"],
		status: "passed",
	}),
	"-e45b128829_51": newTest({
		duration: 0,
		name: "amplifies the signal",
		path: ["-e45b128829", "-e45b128829_51"],
		status: "passed",
	}),
	"-e45b128829_52": newTest({
		duration: 0,
		name: "refills the basket with fresh peaches",
		path: ["-e45b128829", "-e45b128829_52"],
		status: "passed",
	}),
} as const satisfies Record<TestId, Test>

export function fakeVitestTest(props: {
	parentModule: TestModule
	parentSuite: TestSuite | null
	id: string
	name: string
	status: TestState
}): TestCase {
	return {
		type: "test",
		module: props.parentModule,
		parent: props.parentSuite ?? props.parentModule,
		id: props.id,
		name: props.name,
		result: () => ({ state: props.status }) as TestResult,
	} as TestCase
}
