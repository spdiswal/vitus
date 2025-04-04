import type { VitestSuite } from "+models/mappers/MapVitestSuiteToSerialisableSuite"
import type { VitestTest } from "+models/mappers/MapVitestTestToSerialisableTest"
import type { NonEmptyArray } from "+types/NonEmptyArray"

export function mapVitestSuiteOrTestToName(
	suiteOrTest: VitestSuite | VitestTest,
): NonEmptyArray<string> {
	const result: NonEmptyArray<string> = [suiteOrTest.name]
	let current = suiteOrTest.parent

	while (current.type === "suite") {
		result.push(current.name)
		current = current.parent
	}

	result.reverse()
	return result
}
