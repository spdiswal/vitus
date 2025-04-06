import { fileDeleted } from "+api/events/FileDeletedDto"
import { runCompleted } from "+api/events/RunCompletedDto"
import { runStarted } from "+api/events/RunStartedDto"
import { serverRestarted } from "+api/events/ServerRestartedDto"
import { taskUpdated } from "+api/events/TaskUpdatedDto"
import type { FileDto } from "+api/models/FileDto"
import { type DummyFileId, dummyFilePath } from "+api/models/FileDto.fixtures"
import type { SuiteDto } from "+api/models/SuiteDto"
import {
	type DummySuiteId,
	getDummySuiteName,
} from "+api/models/SuiteDto.fixtures"
import type { TestDto } from "+api/models/TestDto"
import {
	type DummyTestId,
	getDummyTestName,
} from "+api/models/TestDto.fixtures"
import { type EventStreamSubscriber, newEventStream } from "+server/EventStream"
import { newEventStreamReporter } from "+server/EventStreamReporter"
import {
	dummyVitestModule,
	dummyVitestSpecification,
} from "+server/models/VitestModule.fixtures"
import { dummyVitestSuite } from "+server/models/VitestSuite.fixtures"
import { dummyVitestTest } from "+server/models/VitestTest.fixtures"
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
		expect(spy).toHaveBeenCalledExactlyOnceWith(serverRestarted())
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
			expect(spy).toHaveBeenCalledExactlyOnceWith(runStarted(fileProps.ids))
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
			expect(spy).toHaveBeenCalledExactlyOnceWith(runCompleted())
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
	const filePath = dummyFilePath(fileId)
	const fileDuration = fileProps.duration

	describe("when the file starts running", () => {
		const module = dummyVitestModule(fileId, {
			status: "pending",
		})

		beforeEach(() => {
			reporter.onTestModuleStart(module)
		})

		it("sends a 'task-updated' event containing the file", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				taskUpdated({
					type: "file",
					id: fileId,
					path: filePath,
					status: "started",
					duration: null,
					errors: [],
				} satisfies FileDto),
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

		it("sends a 'task-updated' event containing the file", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				taskUpdated({
					type: "file",
					id: fileId,
					path: filePath,
					status: "started",
					duration: fileDuration,
					errors: [],
				} satisfies FileDto),
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

		it("sends a 'task-updated' event containing the file", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				taskUpdated({
					type: "file",
					id: fileId,
					path: filePath,
					status: "started",
					duration: fileDuration,
					errors: [],
				} satisfies FileDto),
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

		it("sends a 'task-updated' event containing the file", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(
				taskUpdated({
					type: "file",
					id: fileId,
					path: filePath,
					status: "started",
					duration: fileDuration,
					errors: [],
				} satisfies FileDto),
			)
		})
	})

	describe("when the file has been deleted", () => {
		beforeEach(() => {
			reporter.onTestRemoved(filePath)
		})

		it("sends a 'file-deleted' event", () => {
			expect(spy).toHaveBeenCalledExactlyOnceWith(fileDeleted(filePath))
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
			const topLevelSuiteName = getDummySuiteName(topLevelSuiteId)

			describe("when the suite starts running", () => {
				const suite = dummyVitestSuite(topLevelSuiteId, { status: "pending" })

				beforeEach(() => {
					reporter.onTestSuiteReady(suite)
				})

				it("sends a 'task-updated' event containing the suite", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						taskUpdated({
							type: "suite",
							id: topLevelSuiteId,
							parentId: fileId,
							parentFileId: fileId,
							name: topLevelSuiteName,
							status: "started",
							duration: null,
							errors: [],
						} satisfies SuiteDto),
					)
				})
			})

			describe("when the suite has failed", () => {
				const suite = dummyVitestSuite(topLevelSuiteId, { status: "failed" })

				beforeEach(() => {
					reporter.onTestSuiteResult(suite)
				})

				it("sends a 'task-updated' event containing the suite", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						taskUpdated({
							type: "suite",
							id: topLevelSuiteId,
							parentId: fileId,
							parentFileId: fileId,
							name: topLevelSuiteName,
							status: "started",
							duration: null,
							errors: [],
						} satisfies SuiteDto),
					)
				})
			})

			describe("when the suite has passed", () => {
				const suite = dummyVitestSuite(topLevelSuiteId, { status: "passed" })

				beforeEach(() => {
					reporter.onTestSuiteResult(suite)
				})

				it("sends a 'task-updated' event containing the suite", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						taskUpdated({
							type: "suite",
							id: topLevelSuiteId,
							parentId: fileId,
							parentFileId: fileId,
							name: topLevelSuiteName,
							status: "started",
							duration: null,
							errors: [],
						} satisfies SuiteDto),
					)
				})
			})

			describe("when the suite has been skipped", () => {
				const suite = dummyVitestSuite(topLevelSuiteId, { status: "skipped" })

				beforeEach(() => {
					reporter.onTestSuiteResult(suite)
				})

				it("sends a 'task-updated' event containing the suite", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						taskUpdated({
							type: "suite",
							id: topLevelSuiteId,
							parentId: fileId,
							parentFileId: fileId,
							name: topLevelSuiteName,
							status: "started",
							duration: null,
							errors: [],
						} satisfies SuiteDto),
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
					const nestedTestName = getDummyTestName(nestedTestId)
					const nestedTestDuration = nestedTestProps.duration

					describe("when the test starts running", () => {
						const test = dummyVitestTest(nestedTestId, {
							status: "pending",
						})

						beforeEach(() => {
							reporter.onTestCaseReady(test)
						})

						it("sends a 'task-updated' event containing the test", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								taskUpdated({
									type: "test",
									id: nestedTestId,
									parentId: topLevelSuiteId,
									parentFileId: fileId,
									name: nestedTestName,
									status: "started",
									duration: null,
									errors: [],
								} satisfies TestDto),
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

						it("sends a 'task-updated' event containing the test", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								taskUpdated({
									type: "test",
									id: nestedTestId,
									parentId: topLevelSuiteId,
									parentFileId: fileId,
									name: nestedTestName,
									status: "started",
									duration: null,
									errors: [],
								} satisfies TestDto),
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

						it("sends a 'task-updated' event containing the test", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								taskUpdated({
									type: "test",
									id: nestedTestId,
									parentId: topLevelSuiteId,
									parentFileId: fileId,
									name: nestedTestName,
									status: "started",
									duration: null,
									errors: [],
								} satisfies TestDto),
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

						it("sends a 'task-updated' event containing the test", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								taskUpdated({
									type: "test",
									id: nestedTestId,
									parentId: topLevelSuiteId,
									parentFileId: fileId,
									name: nestedTestName,
									status: "started",
									duration: null,
									errors: [],
								} satisfies TestDto),
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
					const nestedSuiteName = getDummySuiteName(nestedSuiteId)

					describe("when the suite starts running", () => {
						const suite = dummyVitestSuite(nestedSuiteId, { status: "pending" })

						beforeEach(() => {
							reporter.onTestSuiteReady(suite)
						})

						it("sends a 'task-updated' event containing the suite", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								taskUpdated({
									type: "suite",
									id: nestedSuiteId,
									parentId: fileId,
									parentFileId: topLevelSuiteId,
									name: nestedSuiteName,
									status: "started",
									duration: null,
									errors: [],
								} satisfies SuiteDto),
							)
						})
					})

					describe("when the suite has failed", () => {
						const suite = dummyVitestSuite(nestedSuiteId, { status: "failed" })

						beforeEach(() => {
							reporter.onTestSuiteResult(suite)
						})

						it("sends a 'task-updated' event containing the suite", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								taskUpdated({
									type: "suite",
									id: nestedSuiteId,
									parentId: fileId,
									parentFileId: topLevelSuiteId,
									name: nestedSuiteName,
									status: "started",
									duration: null,
									errors: [],
								} satisfies SuiteDto),
							)
						})
					})

					describe("when the suite has passed", () => {
						const suite = dummyVitestSuite(nestedSuiteId, { status: "passed" })

						beforeEach(() => {
							reporter.onTestSuiteResult(suite)
						})

						it("sends a 'task-updated' event containing the suite", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								taskUpdated({
									type: "suite",
									id: nestedSuiteId,
									parentId: fileId,
									parentFileId: topLevelSuiteId,
									name: nestedSuiteName,
									status: "started",
									duration: null,
									errors: [],
								} satisfies SuiteDto),
							)
						})
					})

					describe("when the suite has been skipped", () => {
						const suite = dummyVitestSuite(nestedSuiteId, { status: "skipped" })

						beforeEach(() => {
							reporter.onTestSuiteResult(suite)
						})

						it("sends a 'task-updated' event containing the suite", () => {
							expect(spy).toHaveBeenCalledExactlyOnceWith(
								taskUpdated({
									type: "suite",
									id: nestedSuiteId,
									parentId: fileId,
									parentFileId: topLevelSuiteId,
									name: nestedSuiteName,
									status: "started",
									duration: null,
									errors: [],
								} satisfies SuiteDto),
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
							const nestedTestName = getDummyTestName(nestedTestId)
							const nestedTestDuration = nestedTestProps.duration

							describe("when the test starts running", () => {
								const test = dummyVitestTest(nestedTestId, {
									status: "pending",
								})

								beforeEach(() => {
									reporter.onTestCaseReady(test)
								})

								it("sends a 'task-updated' event containing the test", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										taskUpdated({
											type: "test",
											id: nestedTestId,
											parentId: nestedSuiteId,
											parentFileId: fileId,
											name: nestedTestName,
											status: "started",
											duration: null,
											errors: [],
										} satisfies TestDto),
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

								it("sends a 'task-updated' event containing the test", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										taskUpdated({
											type: "test",
											id: nestedTestId,
											parentId: nestedSuiteId,
											parentFileId: fileId,
											name: nestedTestName,
											status: "started",
											duration: null,
											errors: [],
										} satisfies TestDto),
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

								it("sends a 'task-updated' event containing the test", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										taskUpdated({
											type: "test",
											id: nestedTestId,
											parentId: nestedSuiteId,
											parentFileId: fileId,
											name: nestedTestName,
											status: "started",
											duration: null,
											errors: [],
										} satisfies TestDto),
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

								it("sends a 'task-updated' event containing the test", () => {
									expect(spy).toHaveBeenCalledExactlyOnceWith(
										taskUpdated({
											type: "test",
											id: nestedTestId,
											parentId: nestedSuiteId,
											parentFileId: fileId,
											name: nestedTestName,
											status: "started",
											duration: null,
											errors: [],
										} satisfies TestDto),
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
			const topLevelTestName = getDummyTestName(topLevelTestId)
			const topLevelTestDuration = topLevelTestProps.duration

			describe("when the test starts running", () => {
				const test = dummyVitestTest(topLevelTestId, {
					status: "pending",
				})

				beforeEach(() => {
					reporter.onTestCaseReady(test)
				})

				it("sends a 'task-updated' event containing the test", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						taskUpdated({
							type: "test",
							id: topLevelTestId,
							parentId: fileId,
							parentFileId: fileId,
							name: topLevelTestName,
							status: "started",
							duration: null,
							errors: [],
						} satisfies TestDto),
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

				it("sends a 'task-updated' event containing the test", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						taskUpdated({
							type: "test",
							id: topLevelTestId,
							parentId: fileId,
							parentFileId: fileId,
							name: topLevelTestName,
							status: "started",
							duration: null,
							errors: [],
						} satisfies TestDto),
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

				it("sends a 'task-updated' event containing the test", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						taskUpdated({
							type: "test",
							id: topLevelTestId,
							parentId: fileId,
							parentFileId: fileId,
							name: topLevelTestName,
							status: "started",
							duration: null,
							errors: [],
						} satisfies TestDto),
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

				it("sends a 'task-updated' event containing the test", () => {
					expect(spy).toHaveBeenCalledExactlyOnceWith(
						taskUpdated({
							type: "test",
							id: topLevelTestId,
							parentId: fileId,
							parentFileId: fileId,
							name: topLevelTestName,
							status: "started",
							duration: null,
							errors: [],
						} satisfies TestDto),
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
