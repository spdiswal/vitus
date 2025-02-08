import { FolderOpenIcon } from "+icons/FolderOpenIcon"
import type { Meta, StoryObj } from "@storybook/preact"

type Story = StoryObj<typeof FolderOpenIcon>

export default {
	component: FolderOpenIcon,
} satisfies Meta<typeof FolderOpenIcon>

export const Default: Story = {
	args: {
		class: "size-6",
	},
}
