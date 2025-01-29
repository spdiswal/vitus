import {
	type FileTree,
	type FileTreeEntry,
	type FileTreeFileStatus,
	createSingletonFileTree,
	deletePathInFileTree,
	mergeFileTrees,
} from "+explorer/state/FileTree"
import type { FilePath } from "+types/FilePath"
import { describe, expect, it } from "vitest"

describe.each`
	filePath               | status       | expectedPaths
	${"Apples.tests.ts"}   | ${"started"} | ${["Apples.tests.ts"]}
	${"oranges.tests.tsx"} | ${"passed"}  | ${["oranges.tests.tsx"]}
	${"bananas.tests.ts"}  | ${"failed"}  | ${["bananas.tests.ts"]}
	${"peaches.tests.ts"}  | ${"skipped"} | ${["peaches.tests.ts"]}
`(
	"when creating a singleton file tree from a 1-segment file path $filePath with a status of $status",
	(props: {
		filePath: FilePath
		status: FileTreeFileStatus
		expectedPaths: [FilePath]
	}) => {
		const result = createSingletonFileTree(props.filePath, props.status)

		it("has a root file", () => {
			expect(result).toHaveLength(1)
			expect(result[0]).toEqual({
				type: "file",
				path: props.expectedPaths[0],
				status: props.status,
			} satisfies FileTreeEntry)
		})
	},
)

describe.each`
	filePath                     | status       | expectedPaths
	${"/Apples.tests.ts"}        | ${"started"} | ${["/", "/Apples.tests.ts"]}
	${"D:/oranges.tests.tsx"}    | ${"passed"}  | ${["D:/", "D:/oranges.tests.tsx"]}
	${"volume/bananas.tests.ts"} | ${"failed"}  | ${["volume/", "volume/bananas.tests.ts"]}
	${"C:/peaches.tests.ts"}     | ${"skipped"} | ${["C:/", "C:/peaches.tests.ts"]}
`(
	"when creating a singleton file tree from a 2-segment file path $filePath with a status of $status",
	(props: {
		filePath: FilePath
		status: FileTreeFileStatus
		expectedPaths: [FilePath, FilePath]
	}) => {
		const result = createSingletonFileTree(props.filePath, props.status)

		it("has a root directory with a file", () => {
			expect(result).toHaveLength(1)
			expect(result[0]).toEqual({
				type: "directory",
				path: props.expectedPaths[0],
				children: [
					{
						type: "file",
						path: props.expectedPaths[1],
						status: props.status,
					},
				],
			} satisfies FileTreeEntry)
		})
	},
)

describe.each`
	filePath                                            | status       | expectedPaths
	${"/Users/abc/repos/Apples.tests.ts"}               | ${"started"} | ${["/", "/Users/", "/Users/abc/", "/Users/abc/repos/", "/Users/abc/repos/Apples.tests.ts"]}
	${"D:/Users/abc/Workspaces/oranges.tests.tsx"}      | ${"passed"}  | ${["D:/", "D:/Users/", "D:/Users/abc/", "D:/Users/abc/Workspaces/", "D:/Users/abc/Workspaces/oranges.tests.tsx"]}
	${"volume/documents/fruits/tests/bananas.tests.ts"} | ${"failed"}  | ${["volume/", "volume/documents/", "volume/documents/fruits/", "volume/documents/fruits/tests/", "volume/documents/fruits/tests/bananas.tests.ts"]}
	${"C:/work/software/src/peaches.tests.ts"}          | ${"skipped"} | ${["C:/", "C:/work/", "C:/work/software/", "C:/work/software/src/", "C:/work/software/src/peaches.tests.ts"]}
`(
	"when creating a singleton file tree from a 5-segment file path $filePath with a status of $status",
	(props: {
		filePath: FilePath
		status: FileTreeFileStatus
		expectedPaths: [FilePath, FilePath, FilePath, FilePath, FilePath]
	}) => {
		const result = createSingletonFileTree(props.filePath, props.status)

		it("has a root directory with three levels of subdirectories and a file", () => {
			expect(result).toHaveLength(1)
			expect(result[0]).toEqual({
				type: "directory",
				path: props.expectedPaths[0],
				children: [
					{
						type: "directory",
						path: props.expectedPaths[1],
						children: [
							{
								type: "directory",
								path: props.expectedPaths[2],
								children: [
									{
										type: "directory",
										path: props.expectedPaths[3],
										children: [
											{
												type: "file",
												path: props.expectedPaths[4],
												status: props.status,
											},
										],
									},
								],
							},
						],
					},
				],
			} satisfies FileTreeEntry)
		})
	},
)

describe("when merging two empty file trees", () => {
	const original: FileTree = []
	const patch: FileTree = []

	const result = mergeFileTrees(original, patch)

	it("remains empty", () => {
		expect(result).toEqual([] satisfies FileTree)
	})
})

describe("when merging two file trees with no overlapping root files", () => {
	const original: FileTree = [
		{
			type: "file",
			path: "Apples.tests.ts",
			status: "passed",
		},
		{
			type: "file",
			path: "oranges.tests.tsx",
			status: "failed",
		},
	]
	const patch: FileTree = [
		{
			type: "file",
			path: "bananas.tests.ts",
			status: "skipped",
		},
	]

	const result = mergeFileTrees(original, patch)

	it("preserves all root files in alphabetical order", () => {
		expect(result).toEqual([
			{
				type: "file",
				path: "Apples.tests.ts",
				status: "passed",
			},
			{
				type: "file",
				path: "bananas.tests.ts",
				status: "skipped",
			},
			{
				type: "file",
				path: "oranges.tests.tsx",
				status: "failed",
			},
		] satisfies FileTree)
	})
})

describe("when merging two file trees with an overlapping root file", () => {
	const original: FileTree = [
		{
			type: "file",
			path: "Apples.tests.ts",
			status: "passed",
		},
		{
			type: "file",
			path: "oranges.tests.tsx",
			status: "failed",
		},
	]
	const patch: FileTree = [
		{
			type: "file",
			path: "oranges.tests.tsx",
			status: "passed",
		},
		{
			type: "file",
			path: "bananas.tests.ts",
			status: "started",
		},
	]

	const result = mergeFileTrees(original, patch)

	it("preserves the patched root file", () => {
		expect(result).toEqual([
			{
				type: "file",
				path: "Apples.tests.ts",
				status: "passed",
			},
			{
				type: "file",
				path: "bananas.tests.ts",
				status: "started",
			},
			{
				type: "file",
				path: "oranges.tests.tsx",
				status: "passed",
			},
		] satisfies FileTree)
	})
})

describe("when merging two file trees with no overlapping root directories", () => {
	const original: FileTree = [
		{
			type: "directory",
			path: "xyz/",
			children: [
				{
					type: "file",
					path: "xyz/Apples.tests.ts",
					status: "passed",
				},
				{
					type: "file",
					path: "xyz/oranges.tests.tsx",
					status: "failed",
				},
			],
		},
	]
	const patch: FileTree = [
		{
			type: "directory",
			path: "abc/",
			children: [
				{
					type: "file",
					path: "abc/peaches.tests.ts",
					status: "skipped",
				},
				{
					type: "file",
					path: "abc/bananas.tests.ts",
					status: "skipped",
				},
			],
		},
	]

	const result = mergeFileTrees(original, patch)

	it("preserves all root directories in alphabetical order", () => {
		expect(result).toEqual([
			{
				type: "directory",
				path: "abc/",
				children: [
					{
						type: "file",
						path: "abc/peaches.tests.ts",
						status: "skipped",
					},
					{
						type: "file",
						path: "abc/bananas.tests.ts",
						status: "skipped",
					},
				],
			},
			{
				type: "directory",
				path: "xyz/",
				children: [
					{
						type: "file",
						path: "xyz/Apples.tests.ts",
						status: "passed",
					},
					{
						type: "file",
						path: "xyz/oranges.tests.tsx",
						status: "failed",
					},
				],
			},
		] satisfies FileTree)
	})
})

describe("when merging two file trees with an overlapping root directory and no overlapping files", () => {
	const original: FileTree = [
		{
			type: "directory",
			path: "/",
			children: [
				{
					type: "file",
					path: "/Apples.tests.ts",
					status: "passed",
				},
				{
					type: "file",
					path: "/oranges.tests.tsx",
					status: "failed",
				},
			],
		},
		{
			type: "file",
			path: "lemons.tests.ts",
			status: "passed",
		},
	]
	const patch: FileTree = [
		{
			type: "directory",
			path: "/",
			children: [
				{
					type: "file",
					path: "/bananas.tests.ts",
					status: "failed",
				},
			],
		},
		{
			type: "file",
			path: "peaches.tests.ts",
			status: "passed",
		},
	]

	const result = mergeFileTrees(original, patch)

	it("preserves the root directory and all files in alphabetical order", () => {
		expect(result).toEqual([
			{
				type: "directory",
				path: "/",
				children: [
					{
						type: "file",
						path: "/Apples.tests.ts",
						status: "passed",
					},
					{
						type: "file",
						path: "/bananas.tests.ts",
						status: "failed",
					},
					{
						type: "file",
						path: "/oranges.tests.tsx",
						status: "failed",
					},
				],
			},
			{
				type: "file",
				path: "lemons.tests.ts",
				status: "passed",
			},
			{
				type: "file",
				path: "peaches.tests.ts",
				status: "passed",
			},
		] satisfies FileTree)
	})
})

describe("when merging two file trees with an overlapping root directory and an overlapping file", () => {
	const original: FileTree = [
		{
			type: "directory",
			path: "/",
			children: [
				{
					type: "file",
					path: "/Apples.tests.ts",
					status: "passed",
				},
				{
					type: "file",
					path: "/bananas.tests.ts",
					status: "failed",
				},
				{
					type: "file",
					path: "/oranges.tests.tsx",
					status: "failed",
				},
			],
		},
	]
	const patch: FileTree = [
		{
			type: "directory",
			path: "/",
			children: [
				{
					type: "file",
					path: "/bananas.tests.ts",
					status: "passed",
				},
			],
		},
	]

	const result = mergeFileTrees(original, patch)

	it("preserves the root directory and the patched file", () => {
		expect(result).toEqual([
			{
				type: "directory",
				path: "/",
				children: [
					{
						type: "file",
						path: "/Apples.tests.ts",
						status: "passed",
					},
					{
						type: "file",
						path: "/bananas.tests.ts",
						status: "passed",
					},
					{
						type: "file",
						path: "/oranges.tests.tsx",
						status: "failed",
					},
				],
			},
		] satisfies FileTree)
	})
})

describe("when merging two file trees with an overlapping root directory and no overlapping subdirectories", () => {
	const original: FileTree = [
		{
			type: "directory",
			path: "C:/",
			children: [
				{
					type: "directory",
					path: "C:/Users/",
					children: [
						{
							type: "directory",
							path: "C:/Users/abc/",
							children: [
								{
									type: "file",
									path: "C:/Users/abc/Apples.tests.ts",
									status: "passed",
								},
							],
						},
						{
							type: "file",
							path: "C:/Users/bananas.tests.ts",
							status: "failed",
						},
					],
				},
				{
					type: "file",
					path: "C:/oranges.tests.tsx",
					status: "failed",
				},
			],
		},
	]
	const patch: FileTree = [
		{
			type: "directory",
			path: "C:/",
			children: [
				{
					type: "directory",
					path: "C:/repos/",
					children: [
						{
							type: "file",
							path: "C:/repos/lemons.tests.ts",
							status: "started",
						},
					],
				},
				{
					type: "file",
					path: "C:/peaches.tests.ts",
					status: "skipped",
				},
			],
		},
	]

	const result = mergeFileTrees(original, patch)

	it("preserves the root directory and all subdirectories and files in alphabetical order", () => {
		expect(result).toEqual([
			{
				type: "directory",
				path: "C:/",
				children: [
					{
						type: "directory",
						path: "C:/repos/",
						children: [
							{
								type: "file",
								path: "C:/repos/lemons.tests.ts",
								status: "started",
							},
						],
					},
					{
						type: "directory",
						path: "C:/Users/",
						children: [
							{
								type: "directory",
								path: "C:/Users/abc/",
								children: [
									{
										type: "file",
										path: "C:/Users/abc/Apples.tests.ts",
										status: "passed",
									},
								],
							},
							{
								type: "file",
								path: "C:/Users/bananas.tests.ts",
								status: "failed",
							},
						],
					},
					{
						type: "file",
						path: "C:/oranges.tests.tsx",
						status: "failed",
					},
					{
						type: "file",
						path: "C:/peaches.tests.ts",
						status: "skipped",
					},
				],
			},
		] satisfies FileTree)
	})
})

describe("when merging two file trees with an overlapping root directory and an overlapping subdirectory and no overlapping files", () => {
	const original: FileTree = [
		{
			type: "directory",
			path: "C:/",
			children: [
				{
					type: "directory",
					path: "C:/Users/",
					children: [
						{
							type: "directory",
							path: "C:/Users/abc/",
							children: [
								{
									type: "file",
									path: "C:/Users/abc/Apples.tests.ts",
									status: "passed",
								},
							],
						},
						{
							type: "file",
							path: "C:/Users/bananas.tests.ts",
							status: "failed",
						},
					],
				},
				{
					type: "file",
					path: "C:/oranges.tests.tsx",
					status: "failed",
				},
			],
		},
	]
	const patch: FileTree = [
		{
			type: "directory",
			path: "C:/",
			children: [
				{
					type: "directory",
					path: "C:/Users/",
					children: [
						{
							type: "directory",
							path: "C:/Users/xyz/",
							children: [
								{
									type: "file",
									path: "C:/Users/xyz/peaches.tests.ts",
									status: "passed",
								},
								{
									type: "file",
									path: "C:/Users/xyz/Limes.tests.tsx",
									status: "failed",
								},
							],
						},
						{
							type: "file",
							path: "C:/Users/lemons.tests.ts",
							status: "failed",
						},
					],
				},
			],
		},
	]

	const result = mergeFileTrees(original, patch)

	it("merges the directories and preserves the files in alphabetical order", () => {
		expect(result).toEqual([
			{
				type: "directory",
				path: "C:/",
				children: [
					{
						type: "directory",
						path: "C:/Users/",
						children: [
							{
								type: "directory",
								path: "C:/Users/abc/",
								children: [
									{
										type: "file",
										path: "C:/Users/abc/Apples.tests.ts",
										status: "passed",
									},
								],
							},
							{
								type: "directory",
								path: "C:/Users/xyz/",
								children: [
									{
										type: "file",
										path: "C:/Users/xyz/peaches.tests.ts",
										status: "passed",
									},
									{
										type: "file",
										path: "C:/Users/xyz/Limes.tests.tsx",
										status: "failed",
									},
								],
							},
							{
								type: "file",
								path: "C:/Users/bananas.tests.ts",
								status: "failed",
							},
							{
								type: "file",
								path: "C:/Users/lemons.tests.ts",
								status: "failed",
							},
						],
					},
					{
						type: "file",
						path: "C:/oranges.tests.tsx",
						status: "failed",
					},
				],
			},
		] satisfies FileTree)
	})
})

describe("when merging two file trees with an overlapping root directory and two overlapping subdirectories and three overlapping files", () => {
	const original: FileTree = [
		{
			type: "directory",
			path: "/",
			children: [
				{
					type: "directory",
					path: "/Users/",
					children: [
						{
							type: "directory",
							path: "/Users/abc/",
							children: [
								{
									type: "directory",
									path: "/Users/abc/work/",
									children: [
										{
											type: "file",
											path: "/Users/abc/work/Strawberries.tests.tsx",
											status: "skipped",
										},
									],
								},
								{
									type: "file",
									path: "/Users/abc/Apples.tests.ts",
									status: "passed",
								},
								{
									type: "file",
									path: "/Users/abc/Limes.tests.tsx",
									status: "failed",
								},
							],
						},
						{
							type: "file",
							path: "/Users/bananas.tests.ts",
							status: "failed",
						},
					],
				},
				{
					type: "file",
					path: "/oranges.tests.tsx",
					status: "failed",
				},
			],
		},
	]
	const patch: FileTree = [
		{
			type: "directory",
			path: "/",
			children: [
				{
					type: "directory",
					path: "/Users/",
					children: [
						{
							type: "directory",
							path: "/Users/abc/",
							children: [
								{
									type: "file",
									path: "/Users/abc/Limes.tests.tsx",
									status: "passed",
								},
								{
									type: "file",
									path: "/Users/abc/peaches.tests.ts",
									status: "started",
								},
							],
						},
						{
							type: "file",
							path: "/Users/lemons.tests.ts",
							status: "started",
						},
						{
							type: "file",
							path: "/Users/bananas.tests.ts",
							status: "started",
						},
					],
				},
				{
					type: "file",
					path: "/oranges.tests.tsx",
					status: "passed",
				},
			],
		},
	]

	const result = mergeFileTrees(original, patch)

	it("preserves the non-overlapping entries and the patched entries", () => {
		expect(result).toEqual([
			{
				type: "directory",
				path: "/",
				children: [
					{
						type: "directory",
						path: "/Users/",
						children: [
							{
								type: "directory",
								path: "/Users/abc/",
								children: [
									{
										type: "directory",
										path: "/Users/abc/work/",
										children: [
											{
												type: "file",
												path: "/Users/abc/work/Strawberries.tests.tsx",
												status: "skipped",
											},
										],
									},
									{
										type: "file",
										path: "/Users/abc/Apples.tests.ts",
										status: "passed",
									},
									{
										type: "file",
										path: "/Users/abc/Limes.tests.tsx",
										status: "passed",
									},
									{
										type: "file",
										path: "/Users/abc/peaches.tests.ts",
										status: "started",
									},
								],
							},
							{
								type: "file",
								path: "/Users/bananas.tests.ts",
								status: "started",
							},
							{
								type: "file",
								path: "/Users/lemons.tests.ts",
								status: "started",
							},
						],
					},
					{
						type: "file",
						path: "/oranges.tests.tsx",
						status: "passed",
					},
				],
			},
		] satisfies FileTree)
	})
})

const dummyTree: FileTree = [
	{
		type: "directory",
		path: "/",
		children: [
			{
				type: "directory",
				path: "/Users/",
				children: [
					{
						type: "directory",
						path: "/Users/abc/",
						children: [
							{
								type: "directory",
								path: "/Users/abc/work/",
								children: [
									{
										type: "file",
										path: "/Users/abc/work/Strawberries.tests.tsx",
										status: "skipped",
									},
								],
							},
							{
								type: "file",
								path: "/Users/abc/Apples.tests.ts",
								status: "passed",
							},
							{
								type: "file",
								path: "/Users/abc/peaches.tests.ts",
								status: "started",
							},
						],
					},
					{
						type: "directory",
						path: "/Users/xyz/",
						children: [
							{
								type: "file",
								path: "/Users/xyz/lemons.tests.ts",
								status: "passed",
							},
						],
					},
					{
						type: "file",
						path: "/Users/bananas.tests.ts",
						status: "started",
					},
				],
			},
			{
				type: "file",
				path: "/oranges.tests.tsx",
				status: "passed",
			},
		],
	},
]

describe("when deleting a non-existing path from a file tree", () => {
	const result = deletePathInFileTree(
		dummyTree,
		"/Users/xyz/work/Limes.tests.tsx",
	)

	it("leaves the file tree unchanged", () => {
		expect(result).toEqual(dummyTree)
	})
})

describe("when deleting a file in a multi-entry parent directory from a file tree", () => {
	const result = deletePathInFileTree(dummyTree, "/Users/abc/peaches.tests.ts")

	it("removes the file from the file tree", () => {
		expect(result).toEqual([
			{
				type: "directory",
				path: "/",
				children: [
					{
						type: "directory",
						path: "/Users/",
						children: [
							{
								type: "directory",
								path: "/Users/abc/",
								children: [
									{
										type: "directory",
										path: "/Users/abc/work/",
										children: [
											{
												type: "file",
												path: "/Users/abc/work/Strawberries.tests.tsx",
												status: "skipped",
											},
										],
									},
									{
										type: "file",
										path: "/Users/abc/Apples.tests.ts",
										status: "passed",
									},
								],
							},
							{
								type: "directory",
								path: "/Users/xyz/",
								children: [
									{
										type: "file",
										path: "/Users/xyz/lemons.tests.ts",
										status: "passed",
									},
								],
							},
							{
								type: "file",
								path: "/Users/bananas.tests.ts",
								status: "started",
							},
						],
					},
					{
						type: "file",
						path: "/oranges.tests.tsx",
						status: "passed",
					},
				],
			},
		] satisfies FileTree)
	})
})

describe("when deleting the file in a single-entry parent directory from a file tree", () => {
	const result = deletePathInFileTree(
		dummyTree,
		"/Users/abc/work/Strawberries.tests.tsx",
	)

	it("removes the file and the parent directory from the file tree", () => {
		expect(result).toEqual([
			{
				type: "directory",
				path: "/",
				children: [
					{
						type: "directory",
						path: "/Users/",
						children: [
							{
								type: "directory",
								path: "/Users/abc/",
								children: [
									{
										type: "file",
										path: "/Users/abc/Apples.tests.ts",
										status: "passed",
									},
									{
										type: "file",
										path: "/Users/abc/peaches.tests.ts",
										status: "started",
									},
								],
							},
							{
								type: "directory",
								path: "/Users/xyz/",
								children: [
									{
										type: "file",
										path: "/Users/xyz/lemons.tests.ts",
										status: "passed",
									},
								],
							},
							{
								type: "file",
								path: "/Users/bananas.tests.ts",
								status: "started",
							},
						],
					},
					{
						type: "file",
						path: "/oranges.tests.tsx",
						status: "passed",
					},
				],
			},
		] satisfies FileTree)
	})
})

describe("when deleting a directory in a multi-entry parent directory from a file tree", () => {
	const result = deletePathInFileTree(dummyTree, "/Users/xyz/")

	it("removes the directory and all of its children from the file tree", () => {
		expect(result).toEqual([
			{
				type: "directory",
				path: "/",
				children: [
					{
						type: "directory",
						path: "/Users/",
						children: [
							{
								type: "directory",
								path: "/Users/abc/",
								children: [
									{
										type: "directory",
										path: "/Users/abc/work/",
										children: [
											{
												type: "file",
												path: "/Users/abc/work/Strawberries.tests.tsx",
												status: "skipped",
											},
										],
									},
									{
										type: "file",
										path: "/Users/abc/Apples.tests.ts",
										status: "passed",
									},
									{
										type: "file",
										path: "/Users/abc/peaches.tests.ts",
										status: "started",
									},
								],
							},
							{
								type: "file",
								path: "/Users/bananas.tests.ts",
								status: "started",
							},
						],
					},
					{
						type: "file",
						path: "/oranges.tests.tsx",
						status: "passed",
					},
				],
			},
		] satisfies FileTree)
	})
})

describe("when deleting a directory in a single-entry parent directory from a file tree", () => {
	const result = deletePathInFileTree(
		deletePathInFileTree(
			deletePathInFileTree(dummyTree, "/Users/abc/peaches.tests.ts"),
			"/Users/abc/Apples.tests.ts",
		),
		"/Users/abc/work/",
	)

	it("removes the directory and all of its children and the parent directory from the file tree", () => {
		expect(result).toEqual([
			{
				type: "directory",
				path: "/",
				children: [
					{
						type: "directory",
						path: "/Users/",
						children: [
							{
								type: "directory",
								path: "/Users/xyz/",
								children: [
									{
										type: "file",
										path: "/Users/xyz/lemons.tests.ts",
										status: "passed",
									},
								],
							},
							{
								type: "file",
								path: "/Users/bananas.tests.ts",
								status: "started",
							},
						],
					},
					{
						type: "file",
						path: "/oranges.tests.tsx",
						status: "passed",
					},
				],
			},
		] satisfies FileTree)
	})
})

describe("when deleting the file in two levels of single-entry parent directories from a file tree", () => {
	const result = deletePathInFileTree(
		deletePathInFileTree(
			deletePathInFileTree(
				deletePathInFileTree(
					deletePathInFileTree(dummyTree, "/Users/bananas.tests.ts"),
					"/Users/xyz/",
				),
				"/Users/abc/Apples.tests.ts",
			),
			"/Users/abc/peaches.tests.ts",
		),
		"/Users/abc/work/Strawberries.tests.tsx",
	)

	it("removes the file and the parent directory and the grandparent directory from the file tree", () => {
		expect(result).toEqual([
			{
				type: "directory",
				path: "/",
				children: [
					{
						type: "file",
						path: "/oranges.tests.tsx",
						status: "passed",
					},
				],
			},
		] satisfies FileTree)
	})
})
