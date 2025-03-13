import {
	type ProjectEvents,
	applyProjectEvents,
	logProjectEvents,
} from "+events/ProjectEvent"
import { useBatchedEventStream } from "+events/UseBatchedEventStream"
import type { Project } from "+models/Project"
import { useCallback, useState } from "preact/hooks"

export function useProjectState(initialProject: Project): Project {
	const [project, setProject] = useState(initialProject)

	const handleEvent = useCallback((events: ProjectEvents) => {
		setProject((oldProject) => {
			const updatedProject = applyProjectEvents(oldProject, events)
			logProjectEvents(updatedProject, events)

			return updatedProject
		})
	}, [])

	useBatchedEventStream(handleEvent, 100)
	return project
}
