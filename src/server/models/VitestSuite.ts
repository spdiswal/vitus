import type { SuiteDto } from "+api/models/SuiteDto"
import type { VitestModule } from "+server/models/VitestModule"
import type { VitestTest } from "+server/models/VitestTest"
import type { Duration } from "+types/Duration"
import type { TestSuite } from "vitest/node"

/**
 * A subset of {@link TestSuite} that is easier to mock in unit tests.
 */
export type VitestSuite = Pick<
	TestSuite,
	"errors" | "id" | "module" | "name" | "state" | "type"
> & {
	children: {
		allTests: () => Iterable<VitestTest>
	}
	parent: VitestModule | VitestSuite
}

export function vitestSuiteToDto(suite: VitestSuite): SuiteDto {
	const errors = suite.errors()
	const vitestStatus = suite.state()

	const status =
		errors.length === 0
			? vitestStatus === "pending"
				? "started"
				: vitestStatus
			: "failed"

	return {
		type: "suite",
		id: suite.id,
		parentId: suite.parent.id,
		moduleId: suite.module.id,
		name: suite.name,
		status,
		duration:
			status === "failed" || status === "passed"
				? sumOfTestDurations(suite.children.allTests())
				: null,
		errors: errors,
	}
}

export function sumOfTestDurations(tests: Iterable<VitestTest>): Duration {
	let sum = 0

	for (const test of tests) {
		sum += test.diagnostic()?.duration ?? 0
	}

	return sum
}
