import { type ModuleIds, newModule } from "+models/Module"
import { type Project, newProject } from "+models/Project"
import { logDebug } from "+utilities/Logging"

export type RunStartedEvent = {
	type: "run-started"
	invalidatedModuleIds: ModuleIds
}

export function runStartedEvent(
	props: Omit<RunStartedEvent, "type">,
): RunStartedEvent {
	return { type: "run-started", ...props }
}

export function applyRunStartedEvent(
	project: Project,
	event: RunStartedEvent,
): Project {
	return newProject({
		...project,
		modules: project.modules.map((module) =>
			event.invalidatedModuleIds.includes(module.id)
				? newModule({ ...module, status: "running" })
				: module,
		),
	})
}

export function logRunStartedEvent(
	project: Project,
	event: RunStartedEvent,
): void {
	const { modules, ...loggableProject } = project

	logDebug(
		{
			label: "Run started",
			labelColour: "#1d4ed8",
			message: `Project ${project.status}`,
		},
		{ event, project: loggableProject },
	)
}
