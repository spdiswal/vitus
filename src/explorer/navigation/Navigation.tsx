import { NavigationNode } from "+explorer/navigation/NavigationNode"
import { NavigationSection } from "+explorer/navigation/NavigationSection"
import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function Navigation(props: {
	class?: ClassString
}): Renderable {
	return (
		<nav
			class={cn(
				"py-10 pr-10 h-screen flex flex-col gap-y-10 bg-gray-200/50 dark:bg-gray-900/50 transition",
				"overflow-y-auto [scrollbar-color:var(--color-gray-400)_var(--color-gray-200)] dark:[scrollbar-color:var(--color-gray-700)_var(--color-gray-900)]",
				props.class,
			)}
		>
			<div class="pl-5">
				<input
					class="w-full outline-none bg-gray-200 dark:bg-gray-800 px-5 py-2 rounded-full transition"
					placeholder="Search"
				/>
			</div>
			<NavigationSection heading="Failed (10 tests in 3 files)">
				<NavigationNode name="EventStreamReporter.tests.ts" status="passed">
					<NavigationNode
						name="given a set of test files of $filePaths"
						status="failed"
					>
						<NavigationNode name="when a test run has started" status="failed">
							<NavigationNode
								name="sends a 'run started' event"
								status="failed"
							/>
						</NavigationNode>
						<NavigationNode
							name="when a test run has completed"
							status="passed"
						>
							<NavigationNode
								name="sends a 'run completed' event"
								status="skipped"
							/>
						</NavigationNode>
					</NavigationNode>
					<NavigationNode
						name="given a test file of $filePath"
						status="skipped"
					>
						<NavigationNode
							name="when the test file has been enqueued"
							status="skipped"
						>
							<NavigationNode
								name="sends a 'file registered' event"
								status="commenced"
							/>
						</NavigationNode>
						<NavigationNode
							name="when the test file starts running"
							status="commenced"
						>
							<NavigationNode
								name="sends a 'file started' event"
								status="commenced"
							/>
						</NavigationNode>
						<NavigationNode
							name="when the test file has failed"
							status="commenced"
						>
							<NavigationNode
								name="sends a 'file failed' event"
								status="passed"
							/>
						</NavigationNode>
						<NavigationNode
							name="when the test file has passed"
							status="passed"
						>
							<NavigationNode
								name="sends a 'file passed' event"
								status="passed"
							/>
						</NavigationNode>
						<NavigationNode
							name="when the test file has been skipped"
							status="passed"
						>
							<NavigationNode
								name="sends a 'file skipped' event"
								status="passed"
							/>
						</NavigationNode>
						<NavigationNode
							name="when the test file has been deleted"
							status="passed"
						>
							<NavigationNode
								name="sends a 'file deleted' event"
								status="passed"
							/>
						</NavigationNode>
					</NavigationNode>
				</NavigationNode>
				<NavigationNode name="ExplorerApp.tests.tsx" status="skipped" />
				<NavigationNode name="FileTree.tests.ts" status="skipped" />
			</NavigationSection>
			<NavigationSection heading="Passed (1833 tests)">
				<NavigationNode name="ExplorerApp.tests.tsx" status="skipped" />
				<NavigationNode name="FileTree.tests.ts" status="skipped" />
			</NavigationSection>
			<NavigationSection heading="Skipped (2 tests)">
				<NavigationNode name="ExplorerApp.tests.tsx" status="skipped" />
				<NavigationNode name="FileTree.tests.ts" status="skipped" />
			</NavigationSection>
		</nav>
	)
}
