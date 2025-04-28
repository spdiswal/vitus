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
	dummyModulePath,
	dummyVitestModule,
	dummyVitestSpecification,
} from "+models/Module.fixtures"
import {
	type DummySuiteId,
	dummySuiteName,
	dummyVitestSuite,
} from "+models/Suite.fixtures"
import {
	type DummyTestId,
	dummyTestName,
	dummyVitestTest,
} from "+models/Test.fixtures"
import { newEventStreamReporter } from "+server/EventStreamReporter"
import { getFilenameFromPath } from "+types/Path"
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
	${["3afdd8b6c3", "-1730f876b4", "-e45b128829"]}
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
					runStartedEvent(moduleProps.ids),
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
	${"3afdd8b6c3"}
	${"-1730f876b4"}
	${"-e45b128829"}
`("given a module $id", (moduleProps: { id: DummyModuleId }) => {
	const moduleId = moduleProps.id
	const modulePath = dummyModulePath(moduleId)

	describe("when the module starts running", () => {
		const module = dummyVitestModule(moduleId, {
			status: "pending",
		})

		beforeEach(() => {
			reporter.onTestModuleStart(module)
		})

		it("sends a 'module-started' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				moduleStartedEvent({
					type: "module",
					id: moduleId,
					path: modulePath,
					filename: getFilenameFromPath(modulePath),
					status: "running",
				}),
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
				moduleFailedEvent({
					type: "module",
					id: moduleId,
					path: modulePath,
					filename: getFilenameFromPath(modulePath),
					status: "failed",
				}),
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
				modulePassedEvent({
					type: "module",
					id: moduleId,
					path: modulePath,
					filename: getFilenameFromPath(modulePath),
					status: "passed",
				}),
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
				moduleSkippedEvent({
					type: "module",
					id: moduleId,
					path: modulePath,
					filename: getFilenameFromPath(modulePath),
					status: "skipped",
				}),
			)
		})
	})

	describe("when the module has been deleted", () => {
		beforeEach(() => {
			reporter.onTestRemoved(modulePath)
		})

		it("sends a 'module-deleted' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				moduleDeletedEvent(modulePath),
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
			const topLevelSuiteName = dummySuiteName(topLevelSuiteId)

			describe("when the suite starts running", () => {
				const suite = dummyVitestSuite(topLevelSuiteId, { status: "pending" })

				beforeEach(() => {
					reporter.onTestSuiteReady(suite)
				})

				it("sends a 'suite-started' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						suiteStartedEvent({
							type: "suite",
							id: topLevelSuiteId,
							parentId: moduleId,
							parentModuleId: moduleId,
							name: topLevelSuiteName,
							status: "running",
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
						suiteFailedEvent({
							type: "suite",
							id: topLevelSuiteId,
							parentId: moduleId,
							parentModuleId: moduleId,
							name: topLevelSuiteName,
							status: "failed",
						}),
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
						suitePassedEvent({
							type: "suite",
							id: topLevelSuiteId,
							parentId: moduleId,
							parentModuleId: moduleId,
							name: topLevelSuiteName,
							status: "passed",
						}),
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
						suiteSkippedEvent({
							type: "suite",
							id: topLevelSuiteId,
							parentId: moduleId,
							parentModuleId: moduleId,
							name: topLevelSuiteName,
							status: "skipped",
						}),
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
					const nestedTestName = dummyTestName(nestedTestId)

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
									type: "test",
									id: nestedTestId,
									parentId: topLevelSuiteId,
									parentModuleId: moduleId,
									name: nestedTestName,
									status: "running",
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
									type: "test",
									id: nestedTestId,
									parentId: topLevelSuiteId,
									parentModuleId: moduleId,
									name: nestedTestName,
									status: "failed",
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
									type: "test",
									id: nestedTestId,
									parentId: topLevelSuiteId,
									parentModuleId: moduleId,
									name: nestedTestName,
									status: "passed",
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
									type: "test",
									id: nestedTestId,
									parentId: topLevelSuiteId,
									parentModuleId: moduleId,
									name: nestedTestName,
									status: "skipped",
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
					const nestedSuiteName = dummySuiteName(nestedSuiteId)

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
									type: "suite",
									id: nestedSuiteId,
									parentId: topLevelSuiteId,
									parentModuleId: moduleId,
									name: nestedSuiteName,
									status: "running",
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
								suiteFailedEvent({
									type: "suite",
									id: nestedSuiteId,
									parentId: topLevelSuiteId,
									parentModuleId: moduleId,
									name: nestedSuiteName,
									status: "failed",
								}),
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
								suitePassedEvent({
									type: "suite",
									id: nestedSuiteId,
									parentId: topLevelSuiteId,
									parentModuleId: moduleId,
									name: nestedSuiteName,
									status: "passed",
								}),
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
								suiteSkippedEvent({
									type: "suite",
									id: nestedSuiteId,
									parentId: topLevelSuiteId,
									parentModuleId: moduleId,
									name: nestedSuiteName,
									status: "skipped",
								}),
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
							const nestedTestName = dummyTestName(nestedTestId)

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
											type: "test",
											id: nestedTestId,
											parentId: nestedSuiteId,
											parentModuleId: moduleId,
											name: nestedTestName,
											status: "running",
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
											type: "test",
											id: nestedTestId,
											parentId: nestedSuiteId,
											parentModuleId: moduleId,
											name: nestedTestName,
											status: "failed",
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
											type: "test",
											id: nestedTestId,
											parentId: nestedSuiteId,
											parentModuleId: moduleId,
											name: nestedTestName,
											status: "passed",
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
											type: "test",
											id: nestedTestId,
											parentId: nestedSuiteId,
											parentModuleId: moduleId,
											name: nestedTestName,
											status: "skipped",
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
			const topLevelTestName = dummyTestName(topLevelTestId)

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
							type: "test",
							id: topLevelTestId,
							parentId: moduleId,
							parentModuleId: moduleId,
							name: topLevelTestName,
							status: "running",
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
							type: "test",
							id: topLevelTestId,
							parentId: moduleId,
							parentModuleId: moduleId,
							name: topLevelTestName,
							status: "failed",
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
							type: "test",
							id: topLevelTestId,
							parentId: moduleId,
							parentModuleId: moduleId,
							name: topLevelTestName,
							status: "passed",
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
							type: "test",
							id: topLevelTestId,
							parentId: moduleId,
							parentModuleId: moduleId,
							name: topLevelTestName,
							status: "skipped",
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
