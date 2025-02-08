import type { Preview } from "@storybook/preact"
import "+explorer/Explorer.css"
import {
	type StorybookGlobalTheme,
	storybookGlobalTheme,
	withStorybookGlobalTheme,
} from "+utilities/storybook/StorybookGlobalTheme.decorators"

/**
 * @see https://storybook.js.org/docs/configure#configure-story-rendering
 */
export default {
	/**
	 * @see https://storybook.js.org/docs/writing-stories/decorators#global-decorators
	 */
	decorators: [withStorybookGlobalTheme()],

	/**
	 * @see https://storybook.js.org/docs/essentials/toolbars-and-globals#global-types-and-the-toolbar-annotation
	 */
	globalTypes: {
		theme: storybookGlobalTheme,
	},
	initialGlobals: {
		theme: "side-by-side" satisfies StorybookGlobalTheme,
	},

	/**
	 * @see https://storybook.js.org/docs/writing-stories/parameters#global-parameters
	 */
	parameters: {
		layout: "fullscreen",
	},
} satisfies Preview
