import type { TestDto } from "+api/models/TestDto"
import type { VitestModule } from "+server/models/VitestModule"
import type { VitestSuite } from "+server/models/VitestSuite"
import type { TestCase } from "vitest/node"

/**
 * A subset of {@link TestCase} that is easier to mock in unit tests.
 */
export type VitestTest = Pick<
	TestCase,
	"diagnostic" | "id" | "module" | "name" | "result" | "type"
> & { parent: VitestModule | VitestSuite }

export function vitestTestToDto(test: VitestTest): TestDto {
	const vitestStatus = test.result().state
	const status = vitestStatus === "pending" ? "started" : vitestStatus

	return {
		type: "test",
		id: test.id,
		parentId: test.parent.id,
		// TODO: Map fullName.
		fullName: mapVitestSuiteOrTestToName(test),
		status,
		duration:
			status === "failed" || status === "passed"
				? (test.diagnostic()?.duration ?? 0)
				: null,
		errors: [...(test.result().errors ?? [])],
	}
}
