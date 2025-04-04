import type { SuiteDto } from "+api/models/SuiteDto"
import type { VitestModule } from "+server/models/VitestModule"
import type { TestSuite } from "vitest/node"

/**
 * A subset of {@link TestSuite} that is easier to mock in unit tests.
 */
export type VitestSuite = Pick<
	TestSuite,
	"children" | "errors" | "id" | "module" | "name" | "state" | "type"
> & { parent: VitestModule | VitestSuite }

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
		// TODO: Map fullName.
		fullName: mapVitestSuiteOrTestToName(suite),
		status,
		duration:
			status === "failed" || status !== "passed"
				? // TODO: Map duration.
					mapVitestTestsToDuration(suite.children.allTests())
				: null,
		errors: errors,
	}
}
