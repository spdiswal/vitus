import { builtinModules } from "node:module"
import { join as joinPath, resolve as resolvePath } from "node:path"
import { env } from "node:process"
import { fileURLToPath } from "node:url"
import prefreshPlugin from "@prefresh/vite"
import tailwindcssPlugin from "@tailwindcss/vite"
import { minify as minifyHtml } from "html-minifier-terser"
import { type Plugin as VitePlugin, defineConfig } from "vitest/config"
import tsconfigJson from "./tsconfig.json" assert { type: "json" }

const nodejsModules = builtinModules.map((moduleName) => `node:${moduleName}`)

type ModuleConfig = {
	entrypoint: string
	outputDirectory: string
	outputFilename?: string
}

const moduleConfigs: Record<string, ModuleConfig | undefined> = {
	cli: {
		entrypoint: inProjectDirectory("src/VitusCli.ts"),
		outputDirectory: inProjectDirectory("dist/"),
		outputFilename: "vitus-cli.js",
	},
	dev: {
		entrypoint: inProjectDirectory("src/VitusDev.ts"),
		outputDirectory: inProjectDirectory("dist/"),
		outputFilename: "vitus-dev.js",
	},
	explorer: {
		entrypoint: inProjectDirectory("src/index.html"),
		outputDirectory: inProjectDirectory("dist/explorer/"),
	},
}

const moduleConfig = moduleConfigs[env.MODULE ?? "unknown"]

export default defineConfig({
	build: {
		emptyOutDir: false,
		minify: true,
		outDir: moduleConfig?.outputDirectory,
		rollupOptions: {
			external: [...nodejsModules, "vite", "vitest", "vitest/node"],
			input: moduleConfig?.entrypoint,
			output: {
				entryFileNames: moduleConfig?.outputFilename,
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
