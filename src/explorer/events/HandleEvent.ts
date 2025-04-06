import type { EventDto } from "+api/events/EventDto"
import type { ModuleDeletedDto } from "+api/events/ModuleDeletedDto"
import type { RunStartedDto } from "+api/events/RunStartedDto"
import type { TaskUpdatedDto } from "+api/events/TaskUpdatedDto"
import type { ModuleDto } from "+api/models/ModuleDto"
import type { SubtaskDto } from "+api/models/SubtaskDto"
import {
	addModule,
	dtoToModule,
	enumerateModulesById,
	getModuleById,
	removeModulesByPath,
	updateModule,
} from "+explorer/models/Module"
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
	if (event.type === "module-deleted") {
		handleModuleDeleted(event)
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

	if (task.type === "module") {
		handleModuleUpdated(task)
	} else {
		handleSubtaskUpdated(task)
	}
}

function handleModuleUpdated(module: ModuleDto): void {
	const existingModule = getModuleById(module.id)

	if (existingModule === null) {
		addModule(dtoToModule(module))
	} else {
		updateModule(existingModule, module)
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
	const invalidatedModules = enumerateModulesById(event.invalidatedModuleIds)

	for (const modules of invalidatedModules) {
		modules.status.value = "queued"
		modules.duration.value = null
	}

	setRootStatus("started")
}

function handleRunCompleted(): void {
	removeTasksByStatuses(["queued", "started"])
	refreshRootStatus()
}

function handleModuleDeleted(event: ModuleDeletedDto): void {
	removeModulesByPath(event.path)
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
