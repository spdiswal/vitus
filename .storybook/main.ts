import type { StorybookConfig } from "@storybook/preact-vite"

/**
 * @see https://storybook.js.org/docs/api/main-config/main-config
 */
export default {
	/**
	 * Define glob patterns in the Picomatch format.
	 * @see https://github.com/micromatch/picomatch#globbing-features
	 */
	stories: ["../src/**/*.stories.@(ts|tsx)"],
	addons: [
		"@storybook/addon-a11y",
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
	],
	framework: {
		name: "@storybook/preact-vite",
		options: {},
	},
} satisfies StorybookConfig
