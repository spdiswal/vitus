import { NavigationTreeNode } from "+explorer/navigation/components/NavigationTreeNode"
import { NavigationTreeSection } from "+explorer/navigation/components/NavigationTreeSection"
import { type ClassString, cn } from "+types/ClassString"
import type { Renderable } from "+types/Renderable"

export function NavigationTree(props: {
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
			<NavigationTreeSection heading="Failed (10 tests in 3 files)">
				<NavigationTreeNode name="EventStreamReporter.tests.ts" status="passed">
					<NavigationTreeNode
						name="given a set of test files of $filePaths"
						status="failed"
					>
						<NavigationTreeNode
							name="when a test run has started"
							status="failed"
						>
							<NavigationTreeNode
								name="sends a 'run started' event"
								status="failed"
							/>
						</NavigationTreeNode>
						<NavigationTreeNode
							name="when a test run has completed"
							status="passed"
						>
							<NavigationTreeNode
								name="sends a 'run completed' event"
								status="skipped"
							/>
						</NavigationTreeNode>
					</NavigationTreeNode>
					<NavigationTreeNode
						name="given a test file of $filePath"
						status="skipped"
					>
						<NavigationTreeNode
							name="when the test file has been enqueued"
							status="skipped"
						>
							<NavigationTreeNode
								name="sends a 'file registered' event"
								status="commenced"
							/>
						</NavigationTreeNode>
						<NavigationTreeNode
							name="when the test file starts running"
							status="commenced"
						>
							<NavigationTreeNode
								name="sends a 'file started' event"
								status="commenced"
							/>
						</NavigationTreeNode>
						<NavigationTreeNode
							name="when the test file has failed"
							status="commenced"
						>
							<NavigationTreeNode
								name="sends a 'file failed' event"
								status="passed"
							/>
						</NavigationTreeNode>
						<NavigationTreeNode
							name="when the test file has passed"
							status="passed"
						>
							<NavigationTreeNode
								name="sends a 'file passed' event"
								status="passed"
							/>
						</NavigationTreeNode>
						<NavigationTreeNode
							name="when the test file has been skipped"
							status="passed"
						>
							<NavigationTreeNode
								name="sends a 'file skipped' event"
								status="passed"
							/>
						</NavigationTreeNode>
						<NavigationTreeNode
							name="when the test file has been deleted"
							status="passed"
						>
							<NavigationTreeNode
								name="sends a 'file deleted' event"
								status="passed"
							/>
						</NavigationTreeNode>
					</NavigationTreeNode>
				</NavigationTreeNode>
				<NavigationTreeNode name="ExplorerApp.tests.tsx" status="skipped" />
				<NavigationTreeNode name="FileTree.tests.ts" status="skipped" />
			</NavigationTreeSection>
			<NavigationTreeSection heading="Passed (1833 tests)">
				<NavigationTreeNode name="ExplorerApp.tests.tsx" status="skipped" />
				<NavigationTreeNode name="FileTree.tests.ts" status="skipped" />
			</NavigationTreeSection>
			<NavigationTreeSection heading="Skipped (2 tests)">
				<NavigationTreeNode name="ExplorerApp.tests.tsx" status="skipped" />
				<NavigationTreeNode name="FileTree.tests.ts" status="skipped" />
			</NavigationTreeSection>
		</nav>
	)
}
