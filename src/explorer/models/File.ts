import type { FileDto } from "+api/models/FileDto"
import type { Comparator } from "+types/Comparator"
import type { Duration } from "+types/Duration"
import type { Computed, Reactive } from "+types/Reactive"
import type { TaskId } from "+types/TaskId"
import type { TaskStatus } from "+types/TaskStatus"
import { arrayEquals } from "+utilities/Arrays"
import { filterIterable } from "+utilities/Iterables"
import { enumerateObjectValues, filterObjectByValue } from "+utilities/Objects"
import { computed, signal, useComputed } from "@preact/signals"
import { useRef } from "preact/hooks"

export type File = {
	type: "file"
	id: TaskId
	path: Reactive<string>
	name: Computed<string>
	status: Reactive<TaskStatus>
	duration: Reactive<Duration | null>
	errors: Reactive<Array<unknown>>
}

export type Files = Array<File>

const filesById: Reactive<Record<TaskId, File>> = signal({})

export function initialiseFiles(dtos: Array<FileDto>): void {
	filesById.value = Object.fromEntries(
		dtos.map(dtoToFile).map((file) => [file.id, file]),
	)
}

export function dtoToFile(dto: FileDto): File {
	const path = signal(dto.path)

	return {
		type: "file",
		id: dto.id,
		path,
		name: computed(() => pathToFilename(path.value)),
		status: signal(dto.status),
		duration: signal(dto.duration),
		errors: signal(dto.errors),
	}
}

export function pathToFilename(path: string): string {
	const filenameIndex = path.lastIndexOf("/")

	if (filenameIndex === -1) {
		throw new Error(`Unsupported filename: ${path}`)
	}

	return path.slice(filenameIndex + 1)
}

export function fileToDto(file: File): FileDto {
	return {
		type: "file",
		id: file.id,
		path: file.path.value,
		status: file.status.value,
		duration: file.duration.value,
		errors: file.errors.value,
	}
}

const byName: Comparator<File> = (a, b) =>
	a.name.peek().localeCompare(b.name.peek()) // `peek()` suffices as `name` does not change once a `File` is instantiated. A renamed file results in a new `File` instance.

export function useFiles(): Computed<Files> {
	const cachedFiles = useRef<Files>([])

	return useComputed<Files>(() => {
		const files = Array.from(enumerateFiles()).sort(byName)

		if (arrayEquals(cachedFiles.current, files)) {
			return cachedFiles.current
		}

		cachedFiles.current = files
		return files
	})
}

export function useFile(fileId: TaskId): Computed<File | null> {
	return useComputed(() => getFileById(fileId))
}

export function getFileById(fileId: TaskId): File | null {
	return filesById.value[fileId] ?? null
}

export function addFile(file: File): void {
	filesById.value = { ...filesById.value, [file.id]: file }
}

export function updateFile(existingFile: File, updatedFile: FileDto): void {
	existingFile.path.value = updatedFile.path
	existingFile.status.value = updatedFile.status
	existingFile.duration.value =
		updatedFile.status === "failed" || updatedFile.status === "passed"
			? updatedFile.duration
			: null
}

export function* enumerateFilesById(fileIds: Iterable<TaskId>): Iterable<File> {
	for (const fileId of fileIds) {
		const file = getFileById(fileId)

		if (file !== null) {
			yield file
		}
	}
}

export function* enumerateFilesByStatuses(
	statusesToInclude: Array<TaskStatus>,
): Iterable<File> {
	const statuses = new Set(statusesToInclude)

	return filterIterable(enumerateFiles(), (file) =>
		statuses.has(file.status.value),
	)
}

export function enumerateFiles(): Iterable<File> {
	return enumerateObjectValues(filesById.value)
}

export function removeFilesByPath(path: string): void {
	filesById.value = filterObjectByValue(
		filesById.value,
		(file) => file.path.value !== path,
	)
}

export function removeFilesByStatuses(
	statusesToRemove: Array<TaskStatus>,
): void {
	const statuses = new Set(statusesToRemove)

	filesById.value = filterObjectByValue(
		filesById.value,
		(file) => !statuses.has(file.status.value),
	)
}

export function removeAllFiles(): void {
	filesById.value = {}
}
