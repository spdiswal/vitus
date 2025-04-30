import { moduleDeleted } from "+api/events/ModuleDeleted"
import { moduleUpdated } from "+api/events/ModuleUpdated"
import { runCompleted } from "+api/events/RunCompleted"
import { runStarted } from "+api/events/RunStarted"
import { serverRestarted } from "+api/events/ServerRestarted"
import { subtaskUpdated } from "+api/events/SubtaskUpdated"
import {
	type DummyModuleId,
	dummyModulePath,
} from "+api/models/Module.fixtures"
import { type DummySuiteId, dummySuiteName } from "+api/models/Suite.fixtures"
import { type DummyTestId, dummyTestName } from "+api/models/Test.fixtures"
import { type EventStreamSubscriber, newEventStream } from "+server/EventStream"
import { newEventStreamReporter } from "+server/EventStreamReporter"
import {
	dummyVitestModule,
	dummyVitestSpecification,
} from "+server/models/VitestModule.fixtures"
import { dummyVitestSuite } from "+server/models/VitestSuite.fixtures"
import { dummyVitestTest } from "+server/models/VitestTest.fixtures"
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
		expect(spy).toHaveBeenCalledExactlyOnceWith(serverRestarted())
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
				expect(spy).toHaveBeenCalledExactlyOnceWith(runStarted(moduleProps.ids))
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
				expect(spy).toHaveBeenCalledExactlyOnceWith(runCompleted())
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

	describe("when the module starts", () => {
		const module = dummyVitestModule(moduleId, {
			status: "pending",
		})

		beforeEach(() => {
			reporter.onTestModuleStart(module)
		})

		it("sends a 'module-updated' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				moduleUpdated({
					type: "module",
					id: moduleId,
					path: modulePath,
					filename: getFilenameFromPath(modulePath),
					status: "started",
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

		it("sends a 'module-updated' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				moduleUpdated({
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

		it("sends a 'module-updated' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				moduleUpdated({
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

		it("sends a 'module-updated' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				moduleUpdated({
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
			expect(spy).toHaveBeenCalledExactlyOnceWith(moduleDeleted(modulePath))
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

			describe("when the suite starts", () => {
				const suite = dummyVitestSuite(topLevelSuiteId, { status: "pending" })

				beforeEach(() => {
					reporter.onTestSuiteReady(suite)
				})

				it("sends a 'subtask-updated' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						subtaskUpdated({
							type: "suite",
							id: topLevelSuiteId,
							parentId: moduleId,
							parentModuleId: moduleId,
							name: topLevelSuiteName,
							status: "started",
						}),
					)
				})
			})

			describe("when the suite has failed", () => {
				const suite = dummyVitestSuite(topLevelSuiteId, { status: "failed" })

				beforeEach(() => {
					reporter.onTestSuiteResult(suite)
				})

				it("sends a 'subtask-updated' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						subtaskUpdated({
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

				it("sends a 'subtask-updated' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						subtaskUpdated({
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

				it("sends a 'subtask-updated' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						subtaskUpdated({
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

					describe("when the test starts", () => {
						const test = dummyVitestTest(nestedTestId, {
							status: "pending",
						})

						beforeEach(() => {
							reporter.onTestCaseReady(test)
						})

						it("sends a 'subtask-updated' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								subtaskUpdated({
									type: "test",
									id: nestedTestId,
									parentId: topLevelSuiteId,
									parentModuleId: moduleId,
									name: nestedTestName,
									status: "started",
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

						it("sends a 'subtask-updated' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								subtaskUpdated({
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

						it("sends a 'subtask-updated' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								subtaskUpdated({
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

						it("sends a 'subtask-updated' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								subtaskUpdated({
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

					describe("when the suite starts", () => {
						const suite = dummyVitestSuite(nestedSuiteId, {
							status: "pending",
						})

						beforeEach(() => {
							reporter.onTestSuiteReady(suite)
						})

						it("sends a 'subtask-updated' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								subtaskUpdated({
									type: "suite",
									id: nestedSuiteId,
									parentId: topLevelSuiteId,
									parentModuleId: moduleId,
									name: nestedSuiteName,
									status: "started",
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

						it("sends a 'subtask-updated' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								subtaskUpdated({
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

						it("sends a 'subtask-updated' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								subtaskUpdated({
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

						it("sends a 'subtask-updated' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								subtaskUpdated({
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

							describe("when the test starts", () => {
								const test = dummyVitestTest(nestedTestId, {
									status: "pending",
								})

								beforeEach(() => {
									reporter.onTestCaseReady(test)
								})

								it("sends a 'subtask-updated' event", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										subtaskUpdated({
											type: "test",
											id: nestedTestId,
											parentId: nestedSuiteId,
											parentModuleId: moduleId,
											name: nestedTestName,
											status: "started",
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

								it("sends a 'subtask-updated' event", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										subtaskUpdated({
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

								it("sends a 'subtask-updated' event", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										subtaskUpdated({
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

								it("sends a 'subtask-updated' event", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										subtaskUpdated({
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

			describe("when the test starts", () => {
				const test = dummyVitestTest(topLevelTestId, {
					status: "pending",
				})

				beforeEach(() => {
					reporter.onTestCaseReady(test)
				})

				it("sends a 'subtask-updated' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						subtaskUpdated({
							type: "test",
							id: topLevelTestId,
							parentId: moduleId,
							parentModuleId: moduleId,
							name: topLevelTestName,
							status: "started",
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

				it("sends a 'subtask-updated' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						subtaskUpdated({
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

				it("sends a 'subtask-updated' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						subtaskUpdated({
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

				it("sends a 'subtask-updated' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						subtaskUpdated({
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
