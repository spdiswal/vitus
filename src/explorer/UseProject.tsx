import {
	type ProjectEvents,
	applyProjectEvents,
	logProjectEvents,
} from "+events/ProjectEvent"
import { useBatchedEventStream } from "+events/UseBatchedEventStream"
import type { Project } from "+models/Project"
import type { Renderable } from "+types/Renderable"
import { assertContextValue } from "+utilities/Assertions"
import { createContext } from "preact"
import { useCallback, useContext, useState } from "preact/hooks"

const ProjectContext = createContext<Project | undefined>(undefined)

export function useProject(): Project {
	const project = useContext(ProjectContext)
	assertContextValue("ProjectProvider", project)

	return project
}

export function ProjectProvider(props: {
	initialProject: Project
	children: Renderable
}): Renderable {
	const [project, setProject] = useState(props.initialProject)

	const handleEvent = useCallback((events: ProjectEvents) => {
		setProject((oldProject) => {
			const updatedProject = applyProjectEvents(oldProject, events)
			logProjectEvents(updatedProject, events)

			return updatedProject
		})
	}, [])

	useBatchedEventStream(handleEvent, 100)

	return (
		<ProjectContext.Provider value={project}>
			{props.children}
		</ProjectContext.Provider>
	)
}
