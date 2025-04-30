import { type Events, applyEvents } from "+api/events/Event"
import type { Project } from "+api/models/Project"
import { logProjectEvents } from "+explorer/project/EventLogger"
import { useBatchedEventStream } from "+explorer/project/UseBatchedEventStream"
import type { Renderable } from "+types/Renderable"
import { assertNotNullish } from "+utilities/Assertions"
import { createContext } from "preact"
import { useCallback, useContext, useState } from "preact/hooks"

const ProjectContext = createContext<Project | undefined>(undefined)

export function useProject(): Project {
	const project = useContext(ProjectContext)
	assertNotNullish(project, "project")

	return project
}

export function ProjectProvider(props: {
	initialProject: Project
	children: Renderable
}): Renderable {
	const [project, setProject] = useState(props.initialProject)

	const handleEvent = useCallback((events: Events) => {
		setProject((oldProject) => applyEvents(oldProject, events))
		logProjectEvents(events)
	}, [])

	useBatchedEventStream(handleEvent, 100)

	return (
		<ProjectContext.Provider value={project}>
			{props.children}
		</ProjectContext.Provider>
	)
}
