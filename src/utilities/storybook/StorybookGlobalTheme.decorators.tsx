import type { StoryRenderable } from "+types/Renderable"
import type { StorybookGlobal } from "+types/storybook/StorybookGlobal"
import type { Decorator } from "@storybook/preact"

export type StorybookGlobalTheme = "light" | "dark" | "side-by-side"

export const storybookGlobalTheme: StorybookGlobal<StorybookGlobalTheme> = {
	toolbar: {
		title: "Theme",
		icon: "mirror",
		items: [
			{ title: "Dark", value: "dark" },
			{ title: "Light", value: "light" },
			{ title: "Side-by-side", value: "side-by-side" },
		],
		dynamicTitle: true,
	},
}

export function withStorybookGlobalTheme(): Decorator {
	return (Story, { context }): StoryRenderable => {
		const theme: StorybookGlobalTheme = context.globals.theme

		const storyWithBackground = (
			// Matches the theme classes in `index.html`.
			<div class="p-4 h-screen bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-gray-50">
				<Story />
			</div>
		)

		const storyWithDarkBackground = (
			<div class="dark">{storyWithBackground}</div>
		)

		switch (theme) {
			case "dark": {
				return storyWithDarkBackground
			}
			case "light": {
				return storyWithBackground
			}
			case "side-by-side": {
				return (
					<div class="grid grid-cols-2">
						{storyWithDarkBackground}
						{storyWithBackground}
					</div>
				)
			}
		}
	}
}
