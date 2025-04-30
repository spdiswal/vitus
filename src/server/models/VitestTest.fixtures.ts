import { dummyParentIds } from "+api/models/Module.fixtures"
import { type DummyTestId, dummyTestName } from "+api/models/Test.fixtures"
import { dummyVitestModule } from "+server/models/VitestModule.fixtures"
import { dummyVitestSuite } from "+server/models/VitestSuite.fixtures"
import type {
	VitestTest,
	VitestTestDiagnostic,
} from "+server/models/VitestTest"
import type { TestCase, TestResult, TestState } from "vitest/node"

export function dummyVitestTest(
	id: DummyTestId,
	props: {
		status: TestState
	},
): TestCase {
	const [parentModuleId, parentSuiteId] = dummyParentIds(id)

	const parentModule = dummyVitestModule(parentModuleId, { status: "pending" })
	const parentSuite =
		parentSuiteId !== null
			? dummyVitestSuite(parentSuiteId, { status: "pending" })
			: null

	return {
		type: "test",
		id,
		name: dummyTestName(id),
		module: parentModule,
		parent: parentSuite ?? parentModule,
		result: (): TestResult => getDummyTestResult(props.status),
		diagnostic: (): VitestTestDiagnostic => getDummyTestDiagnostic(0),
	} satisfies VitestTest as TestCase
}

function getDummyTestResult(status: TestState): TestResult {
	switch (status) {
		case "failed": {
			return { state: status, errors: [] }
		}
		case "passed": {
			return { state: status, errors: [] }
		}
		case "pending": {
			return { state: status, errors: undefined }
		}
		case "skipped": {
			return { state: status, errors: undefined, note: undefined }
		}
	}
}

function getDummyTestDiagnostic(
	duration: number | undefined,
): VitestTestDiagnostic | undefined {
	if (duration === undefined) {
		return undefined
	}

	return {
		slow: false,
		flaky: false,
		heap: 0,
		startTime: 0,
		retryCount: 0,
		repeatCount: 0,
		duration,
	}
}
