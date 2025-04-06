import type { FileDto } from "+api/models/FileDto"
import type { VitestSuite } from "+server/models/VitestSuite"
import type { VitestTest } from "+server/models/VitestTest"
import type { TestModule } from "vitest/node"

/**
 * A subset of {@link TestModule} that is easier to mock in unit tests.
 */
export type VitestModule = Pick<
	TestModule,
	"diagnostic" | "errors" | "id" | "moduleId" | "state" | "type"
> & {
	children: {
		allSuites: () => Iterable<VitestSuite>
		allTests: () => Iterable<VitestTest>
	}
}

export type VitestModuleDiagnostic = ReturnType<VitestModule["diagnostic"]>

export function vitestModuleToDto(module: VitestModule): FileDto {
	const errors = module.errors()
	const vitestStatus = module.state()

	const status =
		errors.length === 0
			? vitestStatus === "pending"
				? "started"
				: vitestStatus
			: "failed"

	return {
		type: "file",
		id: module.id,
		path: module.moduleId,
		status,
		duration:
			status === "failed" || status === "passed"
				? module.diagnostic().duration
				: null,
		errors: errors,
	}
}
