import { FolderIcon } from "+icons/FolderIcon"
import type { Meta, StoryObj } from "@storybook/preact"

type Story = StoryObj<typeof FolderIcon>

export default {
	component: FolderIcon,
} satisfies Meta<typeof FolderIcon>

export const Default: Story = {
	args: {
		class: "size-6",
	},
}
