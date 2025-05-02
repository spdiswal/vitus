import type { TestSpecification } from "vitest/node"

/**
 * A subset of {@link TestSpecification} that is easier to mock in unit tests.
 */
export type VitestSpecification = Pick<
	TestSpecification,
	"moduleId" | "testModule"
>
