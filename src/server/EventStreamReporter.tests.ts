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
import { failed, passed, skipped, started } from "+api/models/TaskStatus"
import { type DummyTestId, dummyTestName } from "+api/models/Test.fixtures"
import { type EventStreamSubscriber, newEventStream } from "+server/EventStream"
import { newEventStreamReporter } from "+server/EventStreamReporter"
import { dummyVitestModule } from "+server/models/VitestModule.fixtures"
import { dummyVitestSpecification } from "+server/models/VitestSpecification.fixtures"
import { dummyVitestSuite } from "+server/models/VitestSuite.fixtures"
import { dummyVitestTest } from "+server/models/VitestTest.fixtures"
import type { Duration } from "+types/Duration"
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
			const invalidatedModuleIds = moduleProps.ids
			const specifications = moduleProps.ids.map(dummyVitestSpecification)

			beforeEach(() => {
				reporter.onTestRunStart(specifications)
			})

			it("sends a 'run-started' event", () => {
				expect(spy).toHaveBeenCalledExactlyOnceWith(
					runStarted(invalidatedModuleIds),
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
				expect(spy).toHaveBeenCalledExactlyOnceWith(runCompleted())
			})
		})
	},
)

describe.each`
	moduleId         | duration
	${"15b021ef72"}  | ${5}
	${"3afdd8b6c3"}  | ${11}
	${"-1730f876b4"} | ${21}
	${"-e45b128829"} | ${30}
`(
	"given a module $moduleId",
	(moduleProps: {
		moduleId: DummyModuleId
		duration: Duration
	}) => {
		const moduleId = moduleProps.moduleId
		const modulePath = dummyModulePath(moduleId)
		const moduleDuration = moduleProps.duration

		describe("when the module starts", () => {
			const module = dummyVitestModule(moduleId, { status: "pending" })

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
						status: started(),
					}),
				)
			})
		})

		describe("when the module has failed", () => {
			const module = dummyVitestModule(moduleId, {
				status: "failed",
				duration: moduleDuration,
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
						status: failed(moduleDuration),
					}),
				)
			})
		})

		describe("when the module has passed", () => {
			const module = dummyVitestModule(moduleId, {
				status: "passed",
				duration: moduleDuration,
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
						status: passed(moduleDuration),
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
						status: skipped(),
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
			suiteId
			${`${moduleId}_0`}
			${`${moduleId}_2`}
			${`${moduleId}_4`}
		`(
			"and given a top-level suite $suiteId",
			(topLevelSuiteProps: { suiteId: DummySuiteId }) => {
				const topLevelSuiteId = topLevelSuiteProps.suiteId
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
								status: started(),
							}),
						)
					})
				})

				describe("when the suite has failed", () => {
					const suite = dummyVitestSuite(topLevelSuiteId, {
						status: "failed",
						children: [
							dummyVitestTest(`${topLevelSuiteId}_1`, {
								status: "failed",
								duration: 8,
							}),
							dummyVitestTest(`${topLevelSuiteId}_3`, {
								status: "passed",
								duration: 3,
							}),
							dummyVitestTest(`${topLevelSuiteId}_5`, {
								status: "skipped",
							}),
						],
					})

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
								status: failed(11),
							}),
						)
					})
				})

				describe("when the suite has passed", () => {
					const suite = dummyVitestSuite(topLevelSuiteId, {
						status: "passed",
						children: [
							dummyVitestTest(`${topLevelSuiteId}_1`, {
								status: "passed",
								duration: 15,
							}),
							dummyVitestTest(`${topLevelSuiteId}_3`, {
								status: "passed",
								duration: 2,
							}),
							dummyVitestTest(`${topLevelSuiteId}_5`, {
								status: "passed",
								duration: 3,
							}),
							dummyVitestTest(`${topLevelSuiteId}_7`, {
								status: "skipped",
							}),
						],
					})

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
								status: passed(20),
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
								status: skipped(),
							}),
						)
					})
				})

				describe.each`
					testId                               | duration
					${`${topLevelSuiteProps.suiteId}_1`} | ${1}
					${`${topLevelSuiteProps.suiteId}_3`} | ${6}
					${`${topLevelSuiteProps.suiteId}_5`} | ${10}
				`(
					"and given a nested test $testId",
					(nestedTestProps: {
						testId: DummyTestId
						duration: Duration
					}) => {
						const nestedTestId = nestedTestProps.testId
						const nestedTestName = dummyTestName(nestedTestId)
						const nestedTestDuration = nestedTestProps.duration

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
										status: started(),
									}),
								)
							})
						})

						describe("when the test has failed", () => {
							const test = dummyVitestTest(nestedTestId, {
								status: "failed",
								duration: nestedTestDuration,
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
										status: failed(nestedTestDuration),
									}),
								)
							})
						})

						describe("when the test has passed", () => {
							const test = dummyVitestTest(nestedTestId, {
								status: "passed",
								duration: nestedTestDuration,
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
										status: passed(nestedTestDuration),
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
										status: skipped(),
									}),
								)
							})
						})
					},
				)

				describe.each`
					suiteId
					${`${topLevelSuiteProps.suiteId}_6`}
					${`${topLevelSuiteProps.suiteId}_8`}
				`(
					"and given a nested suite $suiteId",
					(nestedSuiteProps: { suiteId: DummySuiteId }) => {
						const nestedSuiteId = nestedSuiteProps.suiteId
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
										status: started(),
									}),
								)
							})
						})

						describe("when the suite has failed", () => {
							const suite = dummyVitestSuite(nestedSuiteId, {
								status: "failed",
								children: [
									dummyVitestTest(`${topLevelSuiteId}_1`, {
										status: "failed",
										duration: 14,
									}),
									dummyVitestTest(`${topLevelSuiteId}_3`, {
										status: "failed",
										duration: 1,
									}),
								],
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
										status: failed(15),
									}),
								)
							})
						})

						describe("when the suite has passed", () => {
							const suite = dummyVitestSuite(nestedSuiteId, {
								status: "passed",
								children: [
									dummyVitestTest(`${topLevelSuiteId}_1`, {
										status: "passed",
										duration: 0,
									}),
									dummyVitestTest(`${topLevelSuiteId}_3`, {
										status: "passed",
										duration: 1,
									}),
									dummyVitestTest(`${topLevelSuiteId}_5`, {
										status: "skipped",
									}),
									dummyVitestTest(`${topLevelSuiteId}_7`, {
										status: "passed",
										duration: 1,
									}),
									dummyVitestTest(`${topLevelSuiteId}_9`, {
										status: "skipped",
									}),
								],
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
										status: passed(2),
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
										status: skipped(),
									}),
								)
							})
						})

						describe.each`
							testId                  | duration
							${`${nestedSuiteId}_7`} | ${3}
							${`${nestedSuiteId}_9`} | ${12}
						`(
							"and given a nested test $testId",
							(nestedTestProps: {
								testId: DummyTestId
								duration: Duration
							}) => {
								const nestedTestId = nestedTestProps.testId
								const nestedTestName = dummyTestName(nestedTestId)
								const nestedTestDuration = nestedTestProps.duration

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
												status: started(),
											}),
										)
									})
								})

								describe("when the test has failed", () => {
									const test = dummyVitestTest(nestedTestId, {
										status: "failed",
										duration: nestedTestDuration,
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
												status: failed(nestedTestDuration),
											}),
										)
									})
								})

								describe("when the test has passed", () => {
									const test = dummyVitestTest(nestedTestId, {
										status: "passed",
										duration: nestedTestDuration,
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
												status: passed(nestedTestDuration),
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
												status: skipped(),
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
			testId             | duration
			${`${moduleId}_1`} | ${7}
			${`${moduleId}_3`} | ${19}
			${`${moduleId}_5`} | ${26}
		`(
			"and given a top-level test $testId",
			(topLevelTestProps: {
				testId: DummyTestId
				duration: Duration
			}) => {
				const topLevelTestId = topLevelTestProps.testId
				const topLevelTestName = dummyTestName(topLevelTestId)
				const topLevelTestDuration = topLevelTestProps.duration

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
								status: started(),
							}),
						)
					})
				})

				describe("when the test has failed", () => {
					const test = dummyVitestTest(topLevelTestId, {
						status: "failed",
						duration: topLevelTestDuration,
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
								status: failed(topLevelTestDuration),
							}),
						)
					})
				})

				describe("when the test has passed", () => {
					const test = dummyVitestTest(topLevelTestId, {
						status: "passed",
						duration: topLevelTestDuration,
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
								status: passed(topLevelTestDuration),
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
								status: skipped(),
							}),
						)
					})
				})
			},
		)
	},
)

describe("when an unknown module has been deleted", () => {
	beforeEach(() => {
		reporter.onTestRemoved(undefined)
	})

	it("does not send any events", () => {
		expect(spy).not.toHaveBeenCalled()
	})
})
