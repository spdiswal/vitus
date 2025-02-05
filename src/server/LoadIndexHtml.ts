import { readFile } from "node:fs/promises"

export async function loadIndexHtml(
	path: string,
	transform?: (html: string) => Promise<string>,
): Promise<string> {
	const indexHtml = await readFile(path, "utf-8")
	const transformedIndexHtml =
		transform !== undefined ? await transform(indexHtml) : indexHtml
	return transformedIndexHtml.slice(0, -"</body></html>".length)
}
