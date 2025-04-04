import type { EventDto } from "+api/events/EventDto"
import type { FileDeletedDto } from "+api/events/FileDeletedDto"
import type { RunStartedDto } from "+api/events/RunStartedDto"
import type { TaskUpdatedDto } from "+api/events/TaskUpdatedDto"
import type { FileDto } from "+api/models/FileDto"
import type { SubtaskDto } from "+api/models/SubtaskDto"
import {
	addFile,
	dtoToFile,
	enumerateFilesById,
	getFileById,
	removeFilesByPath,
	updateFile,
} from "+explorer/models/File"
import { refreshRootStatus, setRootStatus } from "+explorer/models/RootStatus"
import {
	addSubtask,
	dtoToSubtask,
	getSubtaskById,
} from "+explorer/models/Subtask"
import { assertSuite, updateSuite } from "+explorer/models/Suite"
import {
	enumerateTasksByStatuses,
	removeAllTasks,
	removeOrphanedSubtasks,
	removeTasksByStatuses,
} from "+explorer/models/Task"
import { assertTest, updateTest } from "+explorer/models/Test"

export function handleEvent(event: EventDto): void {
	// Ordered by frequency during a test session, from most common to rarest.
	if (event.type === "task-updated") {
		handleTaskUpdated(event)
	}
	if (event.type === "run-started") {
		handleRunStarted(event)
	}
	if (event.type === "run-completed") {
		handleRunCompleted()
	}
	if (event.type === "file-deleted") {
		handleFileDeleted(event)
	}
	if (event.type === "server-disconnected") {
		handleServerDisconnected()
	}
	if (event.type === "server-restarted") {
		handleServerRestarted()
	}
}

function handleTaskUpdated(event: TaskUpdatedDto): void {
	const task = event.task

	if (task.type === "file") {
		handleFileUpdated(task)
	} else {
		handleSubtaskUpdated(task)
	}
}

function handleFileUpdated(file: FileDto): void {
	const existingFile = getFileById(file.id)

	if (existingFile === null) {
		addFile(dtoToFile(file))
	} else {
		updateFile(existingFile, file)
	}
}

function handleSubtaskUpdated(subtask: SubtaskDto): void {
	const existingSubtask = getSubtaskById(subtask.id)

	if (existingSubtask === null || subtask.type !== existingSubtask.type) {
		addSubtask(dtoToSubtask(subtask))
	} else if (subtask.type === "suite") {
		assertSuite(existingSubtask)
		updateSuite(existingSubtask, subtask)
	} else {
		assertTest(existingSubtask)
		updateTest(existingSubtask, subtask)
	}
}

function handleRunStarted(event: RunStartedDto): void {
	const invalidatedFiles = enumerateFilesById(event.invalidatedFileIds)

	for (const file of invalidatedFiles) {
		file.status.value = "queued"
		file.duration.value = null
	}

	setRootStatus("started")
}

function handleRunCompleted(): void {
	removeTasksByStatuses(["queued", "started"])
	refreshRootStatus()
}

function handleFileDeleted(event: FileDeletedDto): void {
	removeFilesByPath(event.path)
	removeOrphanedSubtasks()
	refreshRootStatus()
}

function handleServerDisconnected(): void {
	const unfinishedTasks = enumerateTasksByStatuses(["queued", "started"])

	for (const task of unfinishedTasks) {
		task.status.value = "skipped"
		task.duration.value = null
	}

	setRootStatus("disconnected")
}

function handleServerRestarted(): void {
	removeAllTasks()
	setRootStatus("started")
}
