import {
	type ProjectEvent,
	applyProjectEvent,
	logProjectEvent,
} from "+events/ProjectEvent"
import { useEventStream } from "+events/UseEventStream"
import type { Project } from "+models/Project"
import { useCallback, useState } from "preact/hooks"

export function useProjectState(initialProject: Project): Project {
	const [project, setProject] = useState(initialProject)

	const handleEvent = useCallback((event: ProjectEvent) => {
		setProject((oldProject) => {
			const updatedProject = applyProjectEvent(oldProject, event)
			logProjectEvent(updatedProject, event)

			return updatedProject
		})
	}, [])

	useEventStream(handleEvent)
	return project
}
