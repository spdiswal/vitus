import type { FileDto } from "+api/models/FileDto"
import type { TestModule } from "vitest/node"

/**
 * A subset of {@link TestModule} that is easier to mock in unit tests.
 */
export type VitestModule = Pick<
	TestModule,
	"diagnostic" | "errors" | "id" | "moduleId" | "state" | "type"
>

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
