import { type Event, applyEvent, logEvent } from "+events/Event"
import { useEventStream } from "+events/UseEventStream"
import type { Project } from "+models/Project"
import { useCallback, useState } from "preact/hooks"

export function useProjectState(initialProject: Project): Project {
	const [project, setProject] = useState(initialProject)

	const handleEvent = useCallback((event: Event) => {
		setProject((oldProject) => {
			const updatedProject = applyEvent(oldProject, event)
			logEvent(updatedProject, event)

			return updatedProject
		})
	}, [])

	useEventStream(handleEvent)
	return project
}
