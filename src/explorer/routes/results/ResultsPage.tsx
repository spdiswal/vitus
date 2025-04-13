import { useProject } from "+explorer/UseProject"
import { Breadcrumbs } from "+explorer/routes/results/Breadcrumbs"
import { DiffLegend } from "+explorer/routes/results/DiffLegend"
import { getModuleById, getSuiteByPath, getTestByPath } from "+models/Project"
import type { SuiteIds } from "+models/Suite"
import type { SuitePath } from "+models/SuitePath"
import type { TestPath } from "+models/TestPath"
import type { Renderable } from "+types/Renderable"
import { notNullish } from "+utilities/Arrays"
import { assertNotNullish } from "+utilities/Assertions"
import { useEffect } from "preact/hooks"
import { useParams } from "wouter-preact"

export function ResultsPage(): Renderable {
	const params = useParams()
	const segments = params["*"]?.split("/")
	assertNotNullish(segments)

	const project = useProject()
	const testPath = segments as TestPath

	const [moduleId, ...suiteAndTestIds] = testPath
	suiteAndTestIds.pop()
	const suiteIds = suiteAndTestIds as SuiteIds

	const module = getModuleById(project, moduleId)

	const suites = suiteIds
		.map((_, index) => [moduleId, ...suiteIds.slice(0, index + 1)] as SuitePath)
		.map((suitePath) => getSuiteByPath(project, suitePath))

	const test = getTestByPath(project, testPath)

	useEffect(() => {
		if (module !== null) {
			document.title = `${module.filename} – Vitest – Vitus`
		}
	}, [module?.path])

	if (module === null || suites.includes(null) || test === null) {
		return null
	}

	return (
		<main class="flex flex-col transition">
			<Breadcrumbs
				modulePath={module.path.substring(project.rootPath.length + 1)}
				suiteNames={suites.filter(notNullish).map((suite) => suite.name)}
				testName={test.name}
			/>
			<h1 class="p-5 text-2xl font-mono font-bold rounded-tl-2xl border-b border-gray-400 dark:border-gray-700 transition">
				AssertionError: expected 29 to be 42
			</h1>
			<div class="group grow relative p-5 text-xl font-mono flex flex-col rounded-bl-2xl transition">
				<span class="">&nbsp;&nbsp;[object Object]</span>
				<span class="text-green-600 dark:text-green-500 transition">- 42</span>
				<span class="text-rose-600 dark:text-rose-500 transition">+ 29</span>
				<DiffLegend class="absolute z-10 p-5 top-0 right-0" />
			</div>
		</main>
	)
}
