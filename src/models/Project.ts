import type { File, FileId, Files } from "+models/File"
import type { Comparator } from "+types/Comparator"
import type { Computed, PickNonComputed } from "+types/Computed"
import type { Duration } from "+types/Duration"
import type { Path } from "+types/Path"
import { toSum } from "+utilities/Arrays"
import { count } from "+utilities/Strings"

export type Project = {
	duration: Computed<Duration>
	files: Files
	isConnected: boolean
	rootPath: Path
	status: Computed<ProjectStatus>
}

export type ProjectStatus = "failed" | "passed" | "running"

const byFilename: Comparator<File> = (a, b) =>
	a.filename.localeCompare(b.filename)

export function newProject(props: PickNonComputed<Project>): Project {
	const files = props.files.toSorted(byFilename)

	return {
		...props,
		files,
		duration: files.map((file) => file.duration).reduce(toSum, 0),
		status: files.some((file) => file.status === "running")
			? "running"
			: files.some((file) => file.status === "failed")
				? "failed"
				: "passed",
	}
}

export function getFileById(project: Project, id: FileId): File | null {
	return project.files.find((file) => file.id === id) ?? null
}

export function putFile(project: Project, updatedFile: File): Project {
	const targetIndex = project.files.findIndex(
		(file) => file.id === updatedFile.id,
	)

	const files: Files =
		targetIndex === -1
			? [...project.files, updatedFile]
			: project.files.with(targetIndex, updatedFile)

	return newProject({ ...project, files })
}

export function assertProjectDuration(
	project: Project,
	duration: Duration,
): void {
	if (project.duration !== duration) {
		throw new Error(
			`Expected the project to have a duration of ${duration} ms, but was ${project.duration} ms`,
		)
	}
}

export function assertProjectFileCount(
	project: Project,
	fileCount: number,
): void {
	if (project.files.length !== fileCount) {
		throw new Error(
			`Expected the project to have ${count(fileCount, "file", "files")}, but got ${count(project.files, "file", "files")}`,
		)
	}
}

export function assertProjectStatus(
	project: Project,
	status: ProjectStatus,
): void {
	if (project.status !== status) {
		throw new Error(
			`Expected the project to have status '${status}', but was '${project.status}'`,
		)
	}
}
