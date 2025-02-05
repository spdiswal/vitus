import { builtinModules } from "node:module"
import { join as joinPath, resolve as resolvePath } from "node:path"
import { env } from "node:process"
import { fileURLToPath } from "node:url"
import prefreshPlugin from "@prefresh/vite"
import tailwindcssPlugin from "@tailwindcss/vite"
import { minify as minifyHtml } from "html-minifier-terser"
import {
	type Plugin as VitePlugin,
	type ViteUserConfig,
	defineConfig,
	mergeConfig,
} from "vitest/config"
import tsconfigJson from "./tsconfig.json" assert { type: "json" }

const nodejsModules = builtinModules.map((moduleName) => `node:${moduleName}`)

export default defineConfig(() => {
	const baseConfiguration: ViteUserConfig = {
		build: {
			emptyOutDir: false,
			minify: true,
			rollupOptions: {
				external: [...nodejsModules, "vite", "vitest", "vitest/node"],
				output: { format: "esm" },
			},
			target: "node20",
		},
		cacheDir: inProjectDirectory("node_modules/.cache/"),
		plugins: [minifyIndexHtmlPlugin(), prefreshPlugin(), tailwindcssPlugin()],
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
			} satisfies ViteUserConfig)
		}
		case "dev-server": {
			return mergeConfig(baseConfiguration, {
				build: {
					outDir: inProjectDirectory("dist/"),
					rollupOptions: {
						input: inProjectDirectory("src/VitusDevServer.ts"),
						output: { entryFileNames: "vitus-dev-server.js" },
					},
				},
			} satisfies ViteUserConfig)
		}
		case "explorer": {
			return mergeConfig(baseConfiguration, {
				build: {
					outDir: inProjectDirectory("dist/explorer/"),
					rollupOptions: {
						input: inProjectDirectory("src/index.html"),
					},
				},
			} satisfies ViteUserConfig)
		}
	}

	return baseConfiguration
})

function tsconfigPathAliases(): Record<string, string> {
	return Object.fromEntries(
		Object.entries(tsconfigJson.compilerOptions.paths).map(
			([alias, [path]]) => [
				alias.slice(0, -"/*".length),
				inProjectDirectory(path.slice(0, -"/*".length)),
			],
		),
	)
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
				removeComments: true,
				sortAttributes: true,
				sortClassName: true,
			}),
	}
}

const projectDirectory = joinPath(fileURLToPath(import.meta.url), "..")

function inProjectDirectory(relativePath: string): string {
	return resolvePath(projectDirectory, relativePath)
}
