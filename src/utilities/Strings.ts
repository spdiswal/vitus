export function count(
	subject: ReadonlyArray<unknown> | number,
	singular: string,
	plural: string,
): string {
	return typeof subject === "number"
		? `${subject} ${pluralise(subject, singular, plural)}`
		: `${subject.length} ${pluralise(subject.length, singular, plural)}`
}

function pluralise(count: number, singular: string, plural: string): string {
	return count === 1 ? singular : plural
}
