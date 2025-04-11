import { builtinModules } from "node:module"
import { join as joinPath, resolve as resolvePath } from "node:path"
import { env } from "node:process"
import { fileURLToPath } from "node:url"
import prefreshPlugin from "@prefresh/vite"
import tailwindcssPlugin from "@tailwindcss/vite"
import { minify as minifyHtml } from "html-minifier-terser"
import {
	type ViteUserConfig as ViteConfig,
	type Plugin as VitePlugin,
	defineConfig,
	mergeConfig,
} from "vitest/config"
import tsconfigJson from "./tsconfig.json" assert { type: "json" }

const nodejsModules = builtinModules.map((moduleName) => `node:${moduleName}`)

export default defineConfig((): ViteConfig => {
	const baseConfiguration: ViteConfig = {
		build: {
			emptyOutDir: false,
			minify: true,
			rollupOptions: {
				external: [...nodejsModules, "vite", "vitest", "vitest/node"],
				output: {
					format: "esm",
				},
			},
			target: "node20",
		},
		cacheDir: inProjectDirectory("node_modules/.cache/"),
		plugins: [
			minifyIndexHtmlPlugin(),
			prefreshPlugin(), // Hot module replacement (HMR) in Preact.
			tailwindcssPlugin(), // Tailwind CSS.
		],
		publicDir: false,
		resolve: {
			alias: {
				...tsconfigPathAliases(),
				...consistentNodejsModules(),
			},
		},
		root: inProjectDirectory("src/"),
		test: {
			include: ["**/*.tests.{ts,tsx}"],
			mockReset: true,
		},
	}

	switch (env.MODULE) {
		case "cli": {
			return mergeConfig(baseConfiguration, {
				build: {
					outDir: inProjectDirectory("dist/"),
					rollupOptions: {
						input: inProjectDirectory("src/VitusCli.ts"),
						output: { entryFileNames: "vitus-cli.js" },
					},
				},
			} satisfies ViteConfig)
		}
		case "dev": {
			return mergeConfig(baseConfiguration, {
				build: {
					outDir: inProjectDirectory("dist/"),
					rollupOptions: {
						input: inProjectDirectory("src/VitusDev.ts"),
						output: { entryFileNames: "vitus-dev.js" },
					},
				},
			} satisfies ViteConfig)
		}
		case "explorer": {
			return mergeConfig(baseConfiguration, {
				build: {
					outDir: inProjectDirectory("dist/explorer/"),
					rollupOptions: {
						input: inProjectDirectory("src/index.html"),
					},
				},
			} satisfies ViteConfig)
		}
	}

	return baseConfiguration
})

function tsconfigPathAliases(): Record<string, string> {
	return Object.fromEntries(
		Object.entries(tsconfigJson.compilerOptions.paths).map((entry) => {
			assertSinglePath(entry)
			const [alias, [path]] = entry
			return [
				alias.slice(0, -"/*".length),
				inProjectDirectory(path.slice(0, -"/*".length)),
			]
		}),
	)
}

function assertSinglePath(
	entry: [alias: string, paths: Array<string>],
): asserts entry is [alias: string, paths: [string]] {
	const [alias, paths] = entry
	if (paths.length !== 1) {
		throw new Error(
			`Path alias '${alias}' in 'tsconfig.json' must specify exactly one path, but has ${paths.length} paths`,
		)
	}
}

function consistentNodejsModules(): Record<string, string> {
	return Object.fromEntries(
		builtinModules.map((moduleName) => [moduleName, `node:${moduleName}`]),
	)
}

/**
 * Minifies `index.html` via `html-minifier-terser`.
 */
function minifyIndexHtmlPlugin(): VitePlugin {
	return {
		name: "vitus:minifyIndexHtml",
		transformIndexHtml: async (html: string): Promise<string> =>
			minifyHtml(html, {
				collapseWhitespace: true,
				minifyCSS: true,
				minifyJS: { ecma: 2023, toplevel: true },
				removeComments: false, // Preserve the outlet comments.
				sortAttributes: true,
				sortClassName: true,
			}),
	}
}

function inProjectDirectory(relativePath: string): string {
	const projectDirectory = joinPath(fileURLToPath(import.meta.url), "..")
	return resolvePath(projectDirectory, relativePath)
}
