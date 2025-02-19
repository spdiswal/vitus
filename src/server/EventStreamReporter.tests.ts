import {
	fakeVitestModule,
	fakeVitestSpecification,
} from "+models/File.fixtures"
import {
	type EventStreamSubscriber,
	createEventStream,
} from "+server/EventStream"
import { createEventStreamReporter } from "+server/EventStreamReporter"
import type { FileEvent } from "+server/events/FileEvent"
import type { RunEvent } from "+server/events/RunEvent"
import type { ServerEvent } from "+server/events/ServerEvent"
import type { SuiteEvent } from "+server/events/SuiteEvent"
import type { TestEvent } from "+server/events/TestEvent"
import type { Path } from "+types/Path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type {
	TestCase,
	TestModule,
	TestModuleState,
	TestResult,
	TestState,
	TestSuite,
	TestSuiteState,
} from "vitest/node"

const eventStream = createEventStream()
const reporter = createEventStreamReporter(eventStream)

const spy = vi.fn<EventStreamSubscriber>()

beforeEach(() => eventStream.subscribe(spy))
afterEach(() => eventStream.unsubscribe(spy))

describe("when the test server restarts", () => {
	beforeEach(() => {
		reporter.onServerRestart()
	})

	it("sends a 'server restarted' event", () => {
		expect(spy).toHaveBeenCalledExactlyOnceWith({
			scope: "server",
			status: "restarted",
		} satisfies ServerEvent)
	})
})

describe.each`
	filePaths
	${["/Users/abc/repos/project/src/Apples.tests.ts"]}
	${["/Users/xyz/Workspace/src/bananas.tests.ts", "/Users/xyz/Workspace/tests/oranges.tests.ts", "/Users/xyz/Workspace/tests/peaches.tests.ts"]}
`(
	"given a set of test files of $filePaths",
	(moduleProps: { filePaths: Array<Path> }) => {
		describe("when a test run has started", () => {
			const specifications = moduleProps.filePaths.map((filePath) =>
				fakeVitestSpecification({ filePath }),
			)

			beforeEach(() => {
				reporter.onTestRunStart(specifications)
			})

			it("sends a 'run started' event", () => {
				expect(spy).toHaveBeenCalledExactlyOnceWith({
					scope: "run",
					status: "started",
					filePaths: moduleProps.filePaths,
				} satisfies RunEvent)
			})
		})

		describe("when a test run has completed", () => {
			const modules = moduleProps.filePaths.map((filePath) =>
				fakeVitestModule({ filePath, status: "passed" }),
			)

			beforeEach(() => {
				reporter.onTestRunEnd(modules, [], "passed")
			})

			it("sends a 'run completed' event", () => {
				expect(spy).toHaveBeenCalledExactlyOnceWith({
					scope: "run",
					status: "completed",
					filePaths: moduleProps.filePaths,
				} satisfies RunEvent)
			})
		})
	},
)

describe.each`
	id               | filePath
	${"15b021ef72"}  | ${"/Users/abc/repos/project/src/Apples.tests.ts"}
	${"-1730f876b4"} | ${"/Users/xyz/Workspace/tests/oranges.tests.ts"}
`(
	"given a test file of $filePath",
	(moduleProps: { id: string; filePath: Path }) => {
		function module(status: TestModuleState): TestModule {
			return fakeVitestModule({ filePath: moduleProps.filePath, status })
		}

		describe("when the test file has been enqueued", () => {
			beforeEach(() => {
				reporter.onTestModuleQueued(module("queued"))
			})

			it("sends a 'file registered' event", () => {
				expect(spy).toHaveBeenCalledExactlyOnceWith({
					scope: "file",
					status: "registered",
					filePath: moduleProps.filePath,
				} satisfies FileEvent)
			})
		})

		describe("when the test file starts running", () => {
			beforeEach(() => {
				reporter.onTestModuleStart(module("pending"))
			})

			it("sends a 'file started' event", () => {
				expect(spy).toHaveBeenCalledExactlyOnceWith({
					scope: "file",
					status: "started",
					filePath: moduleProps.filePath,
				} satisfies FileEvent)
			})
		})

		describe("when the test file has failed", () => {
			beforeEach(() => {
				reporter.onTestModuleEnd(module("failed"))
			})

			it("sends a 'file failed' event", () => {
				expect(spy).toHaveBeenCalledExactlyOnceWith({
					scope: "file",
					status: "failed",
					filePath: moduleProps.filePath,
				} satisfies FileEvent)
			})
		})

		describe("when the test file has passed", () => {
			beforeEach(() => {
				reporter.onTestModuleEnd(module("passed"))
			})

			it("sends a 'file passed' event", () => {
				expect(spy).toHaveBeenCalledExactlyOnceWith({
					scope: "file",
					status: "passed",
					filePath: moduleProps.filePath,
				} satisfies FileEvent)
			})
		})

		describe("when the test file has been skipped", () => {
			beforeEach(() => {
				reporter.onTestModuleEnd(module("skipped"))
			})

			it("sends a 'file skipped' event", () => {
				expect(spy).toHaveBeenCalledExactlyOnceWith({
					scope: "file",
					status: "skipped",
					filePath: moduleProps.filePath,
				} satisfies FileEvent)
			})
		})

		describe("when the test file has been deleted", () => {
			beforeEach(() => {
				reporter.onTestRemoved(moduleProps.filePath)
			})

			it("sends a 'file deleted' event", () => {
				expect(spy).toHaveBeenCalledExactlyOnceWith({
					scope: "file",
					status: "deleted",
					filePath: moduleProps.filePath,
				} satisfies FileEvent)
			})
		})

		describe.each`
			id                       | name
			${`${moduleProps.id}_0`} | ${"a fruit basket"}
			${`${moduleProps.id}_1`} | ${"a hot chocolate machine"}
		`(
			"and given a top-level test suite named $name",
			(topSuiteProps: { id: string; name: string }) => {
				function topSuite(status: TestSuiteState): TestSuite {
					return fakeSuite({
						parentModule: module("pending"),
						parentSuite: null,
						id: topSuiteProps.id,
						name: topSuiteProps.name,
						status,
					})
				}

				describe("when the test suite starts running", () => {
					beforeEach(() => {
						reporter.onTestSuiteReady(topSuite("pending"))
					})

					it("sends a 'suite started' event", () => {
						expect(spy).toHaveBeenCalledExactlyOnceWith({
							scope: "suite",
							status: "started",
							filePath: moduleProps.filePath,
							parentSuiteId: null,
							suiteId: topSuiteProps.id,
							suiteName: topSuiteProps.name,
						} satisfies SuiteEvent)
					})
				})

				describe("when the test suite has failed", () => {
					beforeEach(() => {
						reporter.onTestSuiteResult(topSuite("failed"))
					})

					it("sends a 'suite failed' event", () => {
						expect(spy).toHaveBeenCalledExactlyOnceWith({
							scope: "suite",
							status: "failed",
							filePath: moduleProps.filePath,
							parentSuiteId: null,
							suiteId: topSuiteProps.id,
							suiteName: topSuiteProps.name,
						} satisfies SuiteEvent)
					})
				})

				describe("when the test suite has passed", () => {
					beforeEach(() => {
						reporter.onTestSuiteResult(topSuite("passed"))
					})

					it("sends a 'suite passed' event", () => {
						expect(spy).toHaveBeenCalledExactlyOnceWith({
							scope: "suite",
							status: "passed",
							filePath: moduleProps.filePath,
							parentSuiteId: null,
							suiteId: topSuiteProps.id,
							suiteName: topSuiteProps.name,
						} satisfies SuiteEvent)
					})
				})

				describe("when the test suite has been skipped", () => {
					beforeEach(() => {
						reporter.onTestSuiteResult(topSuite("skipped"))
					})

					it("sends a 'suite skipped' event", () => {
						expect(spy).toHaveBeenCalledExactlyOnceWith({
							scope: "suite",
							status: "skipped",
							filePath: moduleProps.filePath,
							parentSuiteId: null,
							suiteId: topSuiteProps.id,
							suiteName: topSuiteProps.name,
						} satisfies SuiteEvent)
					})
				})

				describe.each`
					id                         | name
					${`${topSuiteProps.id}_0`} | ${"produces one cup of orange juice"}
					${`${topSuiteProps.id}_1`} | ${"boosts the motivation levels"}
				`(
					"and given a nested test case named $name",
					(testProps: { id: string; name: string }) => {
						function test(status: TestState): TestCase {
							return fakeTest({
								parentModule: module("pending"),
								parentSuite: topSuite("pending"),
								id: testProps.id,
								name: testProps.name,
								status,
							})
						}

						describe("when the test case starts running", () => {
							beforeEach(() => {
								reporter.onTestCaseReady(test("pending"))
							})

							it("sends a 'test started' event", () => {
								expect(spy).toHaveBeenCalledExactlyOnceWith({
									scope: "test",
									status: "started",
									filePath: moduleProps.filePath,
									parentSuiteId: topSuiteProps.id,
									testId: testProps.id,
									testName: testProps.name,
								} satisfies TestEvent)
							})
						})

						describe("when the test case has failed", () => {
							beforeEach(() => {
								reporter.onTestCaseResult(test("failed"))
							})

							it("sends a 'test failed' event", () => {
								expect(spy).toHaveBeenCalledExactlyOnceWith({
									scope: "test",
									status: "failed",
									filePath: moduleProps.filePath,
									parentSuiteId: topSuiteProps.id,
									testId: testProps.id,
									testName: testProps.name,
								} satisfies TestEvent)
							})
						})

						describe("when the test case has passed", () => {
							beforeEach(() => {
								reporter.onTestCaseResult(test("passed"))
							})

							it("sends a 'test passed' event", () => {
								expect(spy).toHaveBeenCalledExactlyOnceWith({
									scope: "test",
									status: "passed",
									filePath: moduleProps.filePath,
									parentSuiteId: topSuiteProps.id,
									testId: testProps.id,
									testName: testProps.name,
								} satisfies TestEvent)
							})
						})

						describe("when the test case has been skipped", () => {
							beforeEach(() => {
								reporter.onTestCaseResult(test("skipped"))
							})

							it("sends a 'test skipped' event", () => {
								expect(spy).toHaveBeenCalledExactlyOnceWith({
									scope: "test",
									status: "skipped",
									filePath: moduleProps.filePath,
									parentSuiteId: topSuiteProps.id,
									testId: testProps.id,
									testName: testProps.name,
								} satisfies TestEvent)
							})
						})
					},
				)

				describe.each`
					id                         | name
					${`${topSuiteProps.id}_0`} | ${"and strong dedication"}
					${`${topSuiteProps.id}_1`} | ${"and snowy weather"}
				`(
					"and given a nested test suite named $name",
					(nestedSuiteProps: { id: string; name: string }) => {
						function nestedSuite(status: TestSuiteState): TestSuite {
							return fakeSuite({
								parentModule: module("pending"),
								parentSuite: topSuite("pending"),
								id: nestedSuiteProps.id,
								name: nestedSuiteProps.name,
								status,
							})
						}

						describe("when the test suite starts running", () => {
							beforeEach(() => {
								reporter.onTestSuiteReady(nestedSuite("pending"))
							})

							it("sends a 'suite started' event", () => {
								expect(spy).toHaveBeenCalledExactlyOnceWith({
									scope: "suite",
									status: "started",
									filePath: moduleProps.filePath,
									parentSuiteId: topSuiteProps.id,
									suiteId: nestedSuiteProps.id,
									suiteName: nestedSuiteProps.name,
								} satisfies SuiteEvent)
							})
						})

						describe("when the test suite has failed", () => {
							beforeEach(() => {
								reporter.onTestSuiteResult(nestedSuite("failed"))
							})

							it("sends a 'suite failed' event", () => {
								expect(spy).toHaveBeenCalledExactlyOnceWith({
									scope: "suite",
									status: "failed",
									filePath: moduleProps.filePath,
									parentSuiteId: topSuiteProps.id,
									suiteId: nestedSuiteProps.id,
									suiteName: nestedSuiteProps.name,
								} satisfies SuiteEvent)
							})
						})

						describe("when the test suite has passed", () => {
							beforeEach(() => {
								reporter.onTestSuiteResult(nestedSuite("passed"))
							})

							it("sends a 'suite passed' event", () => {
								expect(spy).toHaveBeenCalledExactlyOnceWith({
									scope: "suite",
									status: "passed",
									filePath: moduleProps.filePath,
									parentSuiteId: topSuiteProps.id,
									suiteId: nestedSuiteProps.id,
									suiteName: nestedSuiteProps.name,
								} satisfies SuiteEvent)
							})
						})

						describe("when the test suite has been skipped", () => {
							beforeEach(() => {
								reporter.onTestSuiteResult(nestedSuite("skipped"))
							})

							it("sends a 'suite skipped' event", () => {
								expect(spy).toHaveBeenCalledExactlyOnceWith({
									scope: "suite",
									status: "skipped",
									filePath: moduleProps.filePath,
									parentSuiteId: topSuiteProps.id,
									suiteId: nestedSuiteProps.id,
									suiteName: nestedSuiteProps.name,
								} satisfies SuiteEvent)
							})
						})

						describe.each`
							id                            | name
							${`${nestedSuiteProps.id}_0`} | ${"produces one cup of orange juice"}
							${`${nestedSuiteProps.id}_1`} | ${"boosts the motivation levels"}
						`(
							"and given a nested test case named $name",
							(testProps: { id: string; name: string }) => {
								function test(status: TestState): TestCase {
									return fakeTest({
										parentModule: module("pending"),
										parentSuite: nestedSuite("pending"),
										id: testProps.id,
										name: testProps.name,
										status,
									})
								}

								describe("when the test case starts running", () => {
									beforeEach(() => {
										reporter.onTestCaseReady(test("pending"))
									})

									it("sends a 'test started' event", () => {
										expect(spy).toHaveBeenCalledExactlyOnceWith({
											scope: "test",
											status: "started",
											filePath: moduleProps.filePath,
											parentSuiteId: nestedSuiteProps.id,
											testId: testProps.id,
											testName: testProps.name,
										} satisfies TestEvent)
									})
								})

								describe("when the test case has failed", () => {
									beforeEach(() => {
										reporter.onTestCaseResult(test("failed"))
									})

									it("sends a 'test failed' event", () => {
										expect(spy).toHaveBeenCalledExactlyOnceWith({
											scope: "test",
											status: "failed",
											filePath: moduleProps.filePath,
											parentSuiteId: nestedSuiteProps.id,
											testId: testProps.id,
											testName: testProps.name,
										} satisfies TestEvent)
									})
								})

								describe("when the test case has passed", () => {
									beforeEach(() => {
										reporter.onTestCaseResult(test("passed"))
									})

									it("sends a 'test passed' event", () => {
										expect(spy).toHaveBeenCalledExactlyOnceWith({
											scope: "test",
											status: "passed",
											filePath: moduleProps.filePath,
											parentSuiteId: nestedSuiteProps.id,
											testId: testProps.id,
											testName: testProps.name,
										} satisfies TestEvent)
									})
								})

								describe("when the test case has been skipped", () => {
									beforeEach(() => {
										reporter.onTestCaseResult(test("skipped"))
									})

									it("sends a 'test skipped' event", () => {
										expect(spy).toHaveBeenCalledExactlyOnceWith({
											scope: "test",
											status: "skipped",
											filePath: moduleProps.filePath,
											parentSuiteId: nestedSuiteProps.id,
											testId: testProps.id,
											testName: testProps.name,
										} satisfies TestEvent)
									})
								})
							},
						)
					},
				)
			},
		)

		describe.each`
			id                       | name
			${`${moduleProps.id}_0`} | ${"produces one cup of orange juice"}
			${`${moduleProps.id}_1`} | ${"boosts the motivation levels"}
		`(
			"and given a top-level test case named $name",
			(testProps: { id: string; name: string }) => {
				function test(status: TestState): TestCase {
					return fakeTest({
						parentModule: module("pending"),
						parentSuite: null,
						id: testProps.id,
						name: testProps.name,
						status,
					})
				}

				describe("when the test case starts running", () => {
					beforeEach(() => {
						reporter.onTestCaseReady(test("pending"))
					})

					it("sends a 'test started' event", () => {
						expect(spy).toHaveBeenCalledExactlyOnceWith({
							scope: "test",
							status: "started",
							filePath: moduleProps.filePath,
							parentSuiteId: null,
							testId: testProps.id,
							testName: testProps.name,
						} satisfies TestEvent)
					})
				})

				describe("when the test case has failed", () => {
					beforeEach(() => {
						reporter.onTestCaseResult(test("failed"))
					})

					it("sends a 'test failed' event", () => {
						expect(spy).toHaveBeenCalledExactlyOnceWith({
							scope: "test",
							status: "failed",
							filePath: moduleProps.filePath,
							parentSuiteId: null,
							testId: testProps.id,
							testName: testProps.name,
						} satisfies TestEvent)
					})
				})

				describe("when the test case has passed", () => {
					beforeEach(() => {
						reporter.onTestCaseResult(test("passed"))
					})

					it("sends a 'test passed' event", () => {
						expect(spy).toHaveBeenCalledExactlyOnceWith({
							scope: "test",
							status: "passed",
							filePath: moduleProps.filePath,
							parentSuiteId: null,
							testId: testProps.id,
							testName: testProps.name,
						} satisfies TestEvent)
					})
				})

				describe("when the test case has been skipped", () => {
					beforeEach(() => {
						reporter.onTestCaseResult(test("skipped"))
					})

					it("sends a 'test skipped' event", () => {
						expect(spy).toHaveBeenCalledExactlyOnceWith({
							scope: "test",
							status: "skipped",
							filePath: moduleProps.filePath,
							parentSuiteId: null,
							testId: testProps.id,
							testName: testProps.name,
						} satisfies TestEvent)
					})
				})
			},
		)
	},
)

describe("when an unknown test file has been deleted", () => {
	beforeEach(() => {
		reporter.onTestRemoved(undefined)
	})

	it("does not send any event", () => {
		expect(spy).not.toHaveBeenCalled()
	})
})

function fakeSuite(props: {
	parentModule: TestModule
	parentSuite: TestSuite | null
	id: string
	name: string
	status: TestSuiteState
}): TestSuite {
	return {
		type: "suite",
		module: props.parentModule,
		parent: props.parentSuite ?? props.parentModule,
		id: props.id,
		name: props.name,
		state: () => props.status,
	} as TestSuite
}

function fakeTest(props: {
	parentModule: TestModule
	parentSuite: TestSuite | null
	id: string
	name: string
	status: TestState
}): TestCase {
	return {
		type: "test",
		module: props.parentModule,
		parent: props.parentSuite ?? props.parentModule,
		id: props.id,
		name: props.name,
		result: () => ({ state: props.status }) as TestResult,
	} as TestCase
}
