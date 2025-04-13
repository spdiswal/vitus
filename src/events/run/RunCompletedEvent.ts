import {
	dropUnfinishedModuleChildren,
	hasNotModuleStatus,
} from "+models/Module"
import { type Project, newProject } from "+models/Project"
import { logDebug } from "+utilities/Logging"

export type RunCompletedEvent = {
	type: "run-completed"
}

export function runCompletedEvent(): RunCompletedEvent {
	return { type: "run-completed" }
}

export function applyRunCompletedEvent(project: Project): Project {
	return newProject({
		...project,
		modules: project.modules
			.filter(hasNotModuleStatus("running"))
			.map(dropUnfinishedModuleChildren),
	})
}

export function logRunCompletedEvent(
	project: Project,
	event: RunCompletedEvent,
): void {
	const { modules, ...loggableProject } = project

	logDebug(
		{
			label: "Run completed",
			labelColour: "#1d4ed8",
			message: `Project ${project.status}`,
		},
		{ event, project: loggableProject },
	)
}
