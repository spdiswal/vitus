import type { VitestSuite } from "+server/models/VitestSuite"
import type { VitestTest } from "+server/models/VitestTest"
import type { NonEmptyArray } from "+types/NonEmptyArray"

export function vitestSuiteOrTestToFullName(
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
