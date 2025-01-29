import type { FilePath } from "+types/FilePath"

export type FileTree = Array<FileTreeEntry>

export type FileTreeEntry = FileTreeDirectory | FileTreeFile

export type FileTreeDirectory = {
	type: "directory"
	path: FilePath
	children: FileTree
}

export type FileTreeFile = {
	type: "file"
	path: FilePath
	status: FileTreeFileStatus
}

export type FileTreeFileStatus =
	| "failed"
	| "passed"
	| "registered"
	| "skipped"
	| "started"

export function createSingletonFileTree(
	path: FilePath,
	status: FileTreeFileStatus,
): FileTree {
	let result: FileTreeEntry = { type: "file", path, status }
	const segments = path.split("/")

	while (segments.length > 1) {
		segments.pop()
		result = {
			type: "directory",
			path: `${segments.join("/")}/`,
			children: [result],
		}
	}

	return [result]
}

const byTypeThenByPath: (a: FileTreeEntry, b: FileTreeEntry) => number = (
	a,
	b,
) =>
	a.type !== b.type
		? a.type.localeCompare(b.type)
		: a.path.localeCompare(b.path, undefined, { sensitivity: "base" })

export function mergeFileTrees(original: FileTree, patch: FileTree): FileTree {
	let result: FileTree = [...original]

	for (const patchEntry of patch) {
		const overlappingEntry =
			result.find((entry) => entry.path === patchEntry.path) ?? null

		if (overlappingEntry !== null) {
			result = result.filter((entry) => entry !== overlappingEntry)

			if (
				overlappingEntry.type === "directory" &&
				patchEntry.type === "directory"
			) {
				result.push({
					...overlappingEntry,
					children: mergeFileTrees(
						overlappingEntry.children,
						patchEntry.children,
					),
				})
			} else {
				result.push(patchEntry)
			}
		} else {
			result.push(patchEntry)
		}
	}

	return result.sort(byTypeThenByPath)
}

export function deletePathInFileTree(
	tree: FileTree,
	pathToDelete: FilePath,
): FileTree {
	return tree
		.filter((entry) => entry.path !== pathToDelete)
		.map((entry) =>
			entry.type === "directory"
				? {
						...entry,
						children: deletePathInFileTree(entry.children, pathToDelete),
					}
				: entry,
		)
		.filter((entry) => entry.type === "file" || entry.children.length > 0)
}
