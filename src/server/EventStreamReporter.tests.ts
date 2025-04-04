import { fileDeletedEvent } from "+events/file/FileDeletedEvent"
import { fileFailedEvent } from "+events/file/FileFailedEvent"
import { filePassedEvent } from "+events/file/FilePassedEvent"
import { fileSkippedEvent } from "+events/file/FileSkippedEvent"
import { fileStartedEvent } from "+events/file/FileStartedEvent"
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
	type DummyFileId,
	dummyVitestModule,
	dummyVitestSpecification,
	getDummyFilePath,
} from "+models/File.fixtures"
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
import { type EventStreamSubscriber, newEventStream } from "+server/EventStream"
import { newEventStreamReporter } from "+server/EventStreamReporter"
import type { Duration } from "+types/Duration"
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
`("given a set of files $ids", (fileProps: { ids: Array<DummyFileId> }) => {
	describe("when a run has started", () => {
		const specifications = fileProps.ids.map(dummyVitestSpecification)

		beforeEach(() => {
			reporter.onTestRunStart(specifications)
		})

		it("sends a 'run-started' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				runStartedEvent({ invalidatedFileIds: fileProps.ids }),
			)
		})
	})

	describe("when a run has completed", () => {
		const modules = fileProps.ids.map((fileId) =>
			dummyVitestModule(fileId, { duration: 1, status: "passed" }),
		)

		beforeEach(() => {
			reporter.onTestRunEnd(modules, [], "passed")
		})

		it("sends a 'run-completed' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(runCompletedEvent())
		})
	})
})

describe.each`
	id               | duration
	${"15b021ef72"}  | ${5}
	${"a3fdd8b6c3"}  | ${11}
	${"-1730f876b4"} | ${21}
	${"-e45b128829"} | ${30}
`("given a file $id", (fileProps: { id: DummyFileId; duration: Duration }) => {
	const fileId = fileProps.id
	const filePath = getDummyFilePath(fileId)
	const fileDuration = fileProps.duration

	describe("when the file starts running", () => {
		const module = dummyVitestModule(fileId, {
			status: "pending",
		})

		beforeEach(() => {
			reporter.onTestModuleStart(module)
		})

		it("sends a 'file-started' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				fileStartedEvent({ id: fileId, path: filePath }),
			)
		})
	})

	describe("when the file has failed", () => {
		const module = dummyVitestModule(fileId, {
			duration: fileDuration,
			status: "failed",
		})

		beforeEach(() => {
			reporter.onTestModuleEnd(module)
		})

		it("sends a 'file-failed' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				fileFailedEvent({ id: fileId, duration: fileDuration }),
			)
		})
	})

	describe("when the file has passed", () => {
		const module = dummyVitestModule(fileId, {
			duration: fileDuration,
			status: "passed",
		})

		beforeEach(() => {
			reporter.onTestModuleEnd(module)
		})

		it("sends a 'file-passed' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				filePassedEvent({ id: fileId, duration: fileDuration }),
			)
		})
	})

	describe("when the file has been skipped", () => {
		const module = dummyVitestModule(fileId, {
			duration: fileDuration,
			status: "skipped",
		})

		beforeEach(() => {
			reporter.onTestModuleEnd(module)
		})

		it("sends a 'file-skipped' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				fileSkippedEvent({ id: fileId, duration: fileDuration }),
			)
		})
	})

	describe("when the file has been deleted", () => {
		beforeEach(() => {
			reporter.onTestRemoved(filePath)
		})

		it("sends a 'file-deleted' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				fileDeletedEvent({ path: filePath }),
			)
		})
	})

	describe.each`
		id
		${`${fileId}_0`}
		${`${fileId}_2`}
		${`${fileId}_4`}
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
				id                              | duration
				${`${topLevelSuiteProps.id}_1`} | ${1}
				${`${topLevelSuiteProps.id}_3`} | ${6}
				${`${topLevelSuiteProps.id}_5`} | ${10}
			`(
				"and given a nested test $id",
				(nestedTestProps: {
					id: DummyTestId
					duration: Duration
				}) => {
					const nestedTestId = nestedTestProps.id
					const nestedTestPath = getDummyTestPath(nestedTestId)
					const nestedTestName = getDummyTestName(nestedTestPath)
					const nestedTestDuration = nestedTestProps.duration

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
							duration: nestedTestDuration,
							status: "failed",
						})

						beforeEach(() => {
							reporter.onTestCaseResult(test)
						})

						it("sends a 'test-failed' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								testFailedEvent({
									duration: nestedTestDuration,
									path: nestedTestPath,
								}),
							)
						})
					})

					describe("when the test has passed", () => {
						const test = dummyVitestTest(nestedTestId, {
							duration: nestedTestDuration,
							status: "passed",
						})

						beforeEach(() => {
							reporter.onTestCaseResult(test)
						})

						it("sends a 'test-passed' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								testPassedEvent({
									duration: nestedTestDuration,
									path: nestedTestPath,
								}),
							)
						})
					})

					describe("when the test has been skipped", () => {
						const test = dummyVitestTest(nestedTestId, {
							duration: nestedTestDuration,
							status: "skipped",
						})

						beforeEach(() => {
							reporter.onTestCaseResult(test)
						})

						it("sends a 'test-skipped' event", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								testSkippedEvent({
									duration: nestedTestDuration,
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
						const suite = dummyVitestSuite(nestedSuiteId, { status: "pending" })

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
						const suite = dummyVitestSuite(nestedSuiteId, { status: "failed" })

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
						const suite = dummyVitestSuite(nestedSuiteId, { status: "passed" })

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
						const suite = dummyVitestSuite(nestedSuiteId, { status: "skipped" })

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
						id                            | duration
						${`${nestedSuiteProps.id}_7`} | ${3}
						${`${nestedSuiteProps.id}_9`} | ${12}
					`(
						"and given a nested test $id",
						(nestedTestProps: {
							id: DummyTestId
							duration: Duration
						}) => {
							const nestedTestId = nestedTestProps.id
							const nestedTestPath = getDummyTestPath(nestedTestId)
							const nestedTestName = getDummyTestName(nestedTestPath)
							const nestedTestDuration = nestedTestProps.duration

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
									duration: nestedTestDuration,
									status: "failed",
								})

								beforeEach(() => {
									reporter.onTestCaseResult(test)
								})

								it("sends a 'test-failed' event", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										testFailedEvent({
											duration: nestedTestDuration,
											path: nestedTestPath,
										}),
									)
								})
							})

							describe("when the test has passed", () => {
								const test = dummyVitestTest(nestedTestId, {
									duration: nestedTestDuration,
									status: "passed",
								})

								beforeEach(() => {
									reporter.onTestCaseResult(test)
								})

								it("sends a 'test-passed' event", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										testPassedEvent({
											duration: nestedTestDuration,
											path: nestedTestPath,
										}),
									)
								})
							})

							describe("when the test has been skipped", () => {
								const test = dummyVitestTest(nestedTestId, {
									duration: nestedTestDuration,
									status: "skipped",
								})

								beforeEach(() => {
									reporter.onTestCaseResult(test)
								})

								it("sends a 'test-skipped' event", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										testSkippedEvent({
											duration: nestedTestDuration,
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
		id               | duration
		${`${fileId}_1`} | ${7}
		${`${fileId}_3`} | ${19}
		${`${fileId}_5`} | ${19}
	`(
		"and given a top-level test $id",
		(topLevelTestProps: {
			id: DummyTestId
			duration: Duration
		}) => {
			const topLevelTestId = topLevelTestProps.id
			const topLevelTestPath = getDummyTestPath(topLevelTestId)
			const topLevelTestName = getDummyTestName(topLevelTestPath)
			const topLevelTestDuration = topLevelTestProps.duration

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
					duration: topLevelTestDuration,
				})

				beforeEach(() => {
					reporter.onTestCaseResult(test)
				})

				it("sends a 'test-failed' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						testFailedEvent({
							duration: topLevelTestDuration,
							path: topLevelTestPath,
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

				it("sends a 'test-passed' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						testPassedEvent({
							duration: topLevelTestDuration,
							path: topLevelTestPath,
						}),
					)
				})
			})

			describe("when the test has been skipped", () => {
				const test = dummyVitestTest(topLevelTestId, {
					status: "skipped",
					duration: topLevelTestDuration,
				})

				beforeEach(() => {
					reporter.onTestCaseResult(test)
				})

				it("sends a 'test-skipped' event", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						testSkippedEvent({
							duration: topLevelTestDuration,
							path: topLevelTestPath,
						}),
					)
				})
			})
		},
	)
})

describe("when an unknown file has been deleted", () => {
	beforeEach(() => {
		reporter.onTestRemoved(undefined)
	})

	it("does not send any events", () => {
		expect(spy).not.toHaveBeenCalled()
	})
})
