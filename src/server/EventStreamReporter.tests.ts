import { type EventStreamSubscriber, newEventStream } from "+events/EventStream"
import { moduleDeletedEvent } from "+events/module/ModuleDeletedEvent"
import { moduleFailedEvent } from "+events/module/ModuleFailedEvent"
import { modulePassedEvent } from "+events/module/ModulePassedEvent"
import { moduleSkippedEvent } from "+events/module/ModuleSkippedEvent"
import { moduleStartedEvent } from "+events/module/ModuleStartedEvent"
import { runCompletedEvent } from "+events/run/RunCompletedEvent"
import { runStartedEvent } from "+events/run/RunStartedEvent"
import { serverRestartedEvent } from "+events/server/ServerRestartedEvent"
import { suiteFailedEvent } from "+events/suite/SuiteFailedEvent"
import { suitePassedEvent } from "+events/suite/SuitePassedEvent"
import { suiteSkippedEvent } from "+events/suite/SuiteSkippedEvent"
import { suiteStartedEvent } from "+events/suite/SuiteStartedEvent"
import { testFailedEvent } from "+events/test/TestFailedEvent"
import { testPassedEvent } from "+events/test/TestPassedEvent"
import { testSkippedEvent } from "+events/test/TestSkippedEvent"
import { testStartedEvent } from "+events/test/TestStartedEvent"
import {
	type DummyModuleId,
	dummyVitestModule,
	dummyVitestSpecification,
	getDummyModulePath,
} from "+models/Module.fixtures"
import {
	type DummySuiteId,
	dummyVitestSuite,
	getDummySuiteName,
	getDummySuitePath,
} from "+models/Suite.fixtures"
import {
	type DummyTestId,
	dummyVitestTest,
	getDummyTestName,
	getDummyTestPath,
} from "+models/Test.fixtures"
import { newEventStreamReporter } from "+server/EventStreamReporter"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const eventStream = newEventStream()
const reporter = newEventStreamReporter(eventStream)

const spy = vi.fn<EventStreamSubscriber>()

beforeEach(() => eventStream.subscribe(spy))
afterEach(() => eventStream.unsubscribe(spy))

describe("when the server restarts", () => {
	beforeEach(() => {
		reporter.onServerRestart()
	})

	it("sends a 'server-restarted' event", () => {
		expect(spy).toHaveBeenCalledExactlyOnceWith(serverRestartedEvent())
	})
})

describe.each`
	ids
	${["15b021ef72"]}
	${["a3fdd8b6c3", "-1730f876b4", "-e45b128829"]}
`(
	"given a set of modules $ids",
	(moduleProps: { ids: Array<DummyModuleId> }) => {
		describe("when a run has started", () => {
			const specifications = moduleProps.ids.map(dummyVitestSpecification)

			beforeEach(() => {
				reporter.onTestRunStart(specifications)
			})

			it("sends a 'run-started' event", () => {
				expect(spy).toHaveBeenCalledExactlyOnceWith(
					runStartedEvent({ invalidatedModuleIds: moduleProps.ids }),
				)
			})
		})

		describe("when a run has completed", () => {
			const modules = moduleProps.ids.map((moduleId) =>
				dummyVitestModule(moduleId, { status: "passed" }),
			)

			beforeEach(() => {
				reporter.onTestRunEnd(modules, [], "passed")
			})

			it("sends a 'run-completed' event", () => {
				expect(spy).toHaveBeenCalledExactlyOnceWith(runCompletedEvent())
			})
		})
	},
)

describe.each`
	id
	${"15b021ef72"}
	${"a3fdd8b6c3"}
	${"-1730f876b4"}
	${"-e45b128829"}
`("given a module $id", (moduleProps: { id: DummyModuleId }) => {
	const moduleId = moduleProps.id
	const modulePath = getDummyModulePath(moduleId)

	describe("when the module starts running", () => {
		const module = dummyVitestModule(moduleId, {
			status: "pending",
		})

		beforeEach(() => {
			reporter.onTestModuleStart(module)
		})

		it("sends a 'module-started' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				moduleStartedEvent({ id: moduleId, path: modulePath }),
			)
		})
	})

	describe("when the module has failed", () => {
		const module = dummyVitestModule(moduleId, {
			status: "failed",
		})

		beforeEach(() => {
			reporter.onTestModuleEnd(module)
		})

		it("sends a 'module-failed' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				moduleFailedEvent({ id: moduleId }),
			)
		})
	})

	describe("when the module has passed", () => {
		const module = dummyVitestModule(moduleId, {
			status: "passed",
		})

		beforeEach(() => {
			reporter.onTestModuleEnd(module)
		})

		it("sends a 'module-passed' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				modulePassedEvent({ id: moduleId }),
			)
		})
	})

	describe("when the module has been skipped", () => {
		const module = dummyVitestModule(moduleId, {
			status: "skipped",
		})

		beforeEach(() => {
			reporter.onTestModuleEnd(module)
		})

		it("sends a 'module-skipped' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				moduleSkippedEvent({ id: moduleId }),
			)
		})
	})

	describe("when the module has been deleted", () => {
		beforeEach(() => {
			reporter.onTestRemoved(modulePath)
		})

		it("sends a 'module-deleted' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				moduleDeletedEvent({ path: modulePath }),
			)
		})
	})

	describe.each`
		id
		${`${moduleId}_0`}
		${`${moduleId}_2`}
		${`${moduleId}_4`}
	`(
		"and given a top-level suite $id",
		(topLevelSuiteProps: { id: DummySuiteId }) => {
			const topLevelSuiteId = topLevelSuiteProps.id
			const topLevelSuitePath = getDummySuitePath(topLevelSuiteId)
			const topLevelSuiteName = getDummySuiteName(topLevelSuitePath)

			describe("when the suite starts running", () => {
				const suite = dummyVitestSuite(topLevelSuiteId, { status: "pending" })

				beforeEach(() => {
					reporter.onTestSuiteReady(suite)
				})

				it("sends a 'suite-started' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						suiteStartedEvent({
							name: topLevelSuiteName,
							path: topLevelSuitePath,
						}),
					)
				})
			})

			describe("when the suite has failed", () => {
				const suite = dummyVitestSuite(topLevelSuiteId, { status: "failed" })

				beforeEach(() => {
					reporter.onTestSuiteResult(suite)
				})

				it("sends a 'suite-failed' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						suiteFailedEvent({ path: topLevelSuitePath }),
					)
				})
			})

			describe("when the suite has passed", () => {
				const suite = dummyVitestSuite(topLevelSuiteId, { status: "passed" })

				beforeEach(() => {
					reporter.onTestSuiteResult(suite)
				})

				it("sends a 'suite-passed' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						suitePassedEvent({ path: topLevelSuitePath }),
					)
				})
			})

			describe("when the suite has been skipped", () => {
				const suite = dummyVitestSuite(topLevelSuiteId, { status: "skipped" })

				beforeEach(() => {
					reporter.onTestSuiteResult(suite)
				})

				it("sends a 'suite-skipped' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						suiteSkippedEvent({ path: topLevelSuitePath }),
					)
				})
			})

			describe.each`
				id
				${`${topLevelSuiteProps.id}_1`}
				${`${topLevelSuiteProps.id}_3`}
				${`${topLevelSuiteProps.id}_5`}
			`(
				"and given a nested test $id",
				(nestedTestProps: {
					id: DummyTestId
				}) => {
					const nestedTestId = nestedTestProps.id
					const nestedTestPath = getDummyTestPath(nestedTestId)
					const nestedTestName = getDummyTestName(nestedTestPath)

					describe("when the test starts running", () => {
						const test = dummyVitestTest(nestedTestId, {
							status: "pending",
						})

						beforeEach(() => {
							reporter.onTestCaseReady(test)
						})

						it("sends a 'test-started' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								testStartedEvent({
									name: nestedTestName,
									path: nestedTestPath,
								}),
							)
						})
					})

					describe("when the test has failed", () => {
						const test = dummyVitestTest(nestedTestId, {
							status: "failed",
						})

						beforeEach(() => {
							reporter.onTestCaseResult(test)
						})

						it("sends a 'test-failed' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								testFailedEvent({
									path: nestedTestPath,
								}),
							)
						})
					})

					describe("when the test has passed", () => {
						const test = dummyVitestTest(nestedTestId, {
							status: "passed",
						})

						beforeEach(() => {
							reporter.onTestCaseResult(test)
						})

						it("sends a 'test-passed' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								testPassedEvent({
									path: nestedTestPath,
								}),
							)
						})
					})

					describe("when the test has been skipped", () => {
						const test = dummyVitestTest(nestedTestId, {
							status: "skipped",
						})

						beforeEach(() => {
							reporter.onTestCaseResult(test)
						})

						it("sends a 'test-skipped' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								testSkippedEvent({
									path: nestedTestPath,
								}),
							)
						})
					})
				},
			)

			describe.each`
				id
				${`${topLevelSuiteProps.id}_6`}
				${`${topLevelSuiteProps.id}_8`}
			`(
				"and given a nested suite $id",
				(nestedSuiteProps: { id: DummySuiteId }) => {
					const nestedSuiteId = nestedSuiteProps.id
					const nestedSuitePath = getDummySuitePath(nestedSuiteId)
					const nestedSuiteName = getDummySuiteName(nestedSuitePath)

					describe("when the suite starts running", () => {
						const suite = dummyVitestSuite(nestedSuiteId, {
							status: "pending",
						})

						beforeEach(() => {
							reporter.onTestSuiteReady(suite)
						})

						it("sends a 'suite-started' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								suiteStartedEvent({
									name: nestedSuiteName,
									path: nestedSuitePath,
								}),
							)
						})
					})

					describe("when the suite has failed", () => {
						const suite = dummyVitestSuite(nestedSuiteId, {
							status: "failed",
						})

						beforeEach(() => {
							reporter.onTestSuiteResult(suite)
						})

						it("sends a 'suite-failed' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								suiteFailedEvent({ path: nestedSuitePath }),
							)
						})
					})

					describe("when the suite has passed", () => {
						const suite = dummyVitestSuite(nestedSuiteId, {
							status: "passed",
						})

						beforeEach(() => {
							reporter.onTestSuiteResult(suite)
						})

						it("sends a 'suite-passed' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								suitePassedEvent({ path: nestedSuitePath }),
							)
						})
					})

					describe("when the suite has been skipped", () => {
						const suite = dummyVitestSuite(nestedSuiteId, {
							status: "skipped",
						})

						beforeEach(() => {
							reporter.onTestSuiteResult(suite)
						})

						it("sends a 'suite-skipped' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								suiteSkippedEvent({ path: nestedSuitePath }),
							)
						})
					})

					describe.each`
						id
						${`${nestedSuiteProps.id}_7`}
						${`${nestedSuiteProps.id}_9`}
					`(
						"and given a nested test $id",
						(nestedTestProps: {
							id: DummyTestId
						}) => {
							const nestedTestId = nestedTestProps.id
							const nestedTestPath = getDummyTestPath(nestedTestId)
							const nestedTestName = getDummyTestName(nestedTestPath)

							describe("when the test starts running", () => {
								const test = dummyVitestTest(nestedTestId, {
									status: "pending",
								})

								beforeEach(() => {
									reporter.onTestCaseReady(test)
								})

								it("sends a 'test-started' event", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										testStartedEvent({
											name: nestedTestName,
											path: nestedTestPath,
										}),
									)
								})
							})

							describe("when the test has failed", () => {
								const test = dummyVitestTest(nestedTestId, {
									status: "failed",
								})

								beforeEach(() => {
									reporter.onTestCaseResult(test)
								})

								it("sends a 'test-failed' event", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										testFailedEvent({
											path: nestedTestPath,
										}),
									)
								})
							})

							describe("when the test has passed", () => {
								const test = dummyVitestTest(nestedTestId, {
									status: "passed",
								})

								beforeEach(() => {
									reporter.onTestCaseResult(test)
								})

								it("sends a 'test-passed' event", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										testPassedEvent({
											path: nestedTestPath,
										}),
									)
								})
							})

							describe("when the test has been skipped", () => {
								const test = dummyVitestTest(nestedTestId, {
									status: "skipped",
								})

								beforeEach(() => {
									reporter.onTestCaseResult(test)
								})

								it("sends a 'test-skipped' event", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										testSkippedEvent({
											path: nestedTestPath,
										}),
									)
								})
							})
						},
					)
				},
			)
		},
	)

	describe.each`
		id
		${`${moduleId}_1`}
		${`${moduleId}_3`}
		${`${moduleId}_5`}
	`(
		"and given a top-level test $id",
		(topLevelTestProps: {
			id: DummyTestId
		}) => {
			const topLevelTestId = topLevelTestProps.id
			const topLevelTestPath = getDummyTestPath(topLevelTestId)
			const topLevelTestName = getDummyTestName(topLevelTestPath)

			describe("when the test starts running", () => {
				const test = dummyVitestTest(topLevelTestId, {
					status: "pending",
				})

				beforeEach(() => {
					reporter.onTestCaseReady(test)
				})

				it("sends a 'test-started' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						testStartedEvent({
							name: topLevelTestName,
							path: topLevelTestPath,
						}),
					)
				})
			})

			describe("when the test has failed", () => {
				const test = dummyVitestTest(topLevelTestId, {
					status: "failed",
				})

				beforeEach(() => {
					reporter.onTestCaseResult(test)
				})

				it("sends a 'test-failed' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						testFailedEvent({
							path: topLevelTestPath,
						}),
					)
				})
			})

			describe("when the test has passed", () => {
				const test = dummyVitestTest(topLevelTestId, {
					status: "passed",
				})

				beforeEach(() => {
					reporter.onTestCaseResult(test)
				})

				it("sends a 'test-passed' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						testPassedEvent({
							path: topLevelTestPath,
						}),
					)
				})
			})

			describe("when the test has been skipped", () => {
				const test = dummyVitestTest(topLevelTestId, {
					status: "skipped",
				})

				beforeEach(() => {
					reporter.onTestCaseResult(test)
				})

				it("sends a 'test-skipped' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						testSkippedEvent({
							path: topLevelTestPath,
						}),
					)
				})
			})
		},
	)
})

describe("when an unknown module has been deleted", () => {
	beforeEach(() => {
		reporter.onTestRemoved(undefined)
	})

	it("does not send any events", () => {
		expect(spy).not.toHaveBeenCalled()
	})
})
