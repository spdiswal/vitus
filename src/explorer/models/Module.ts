import type { ModuleDto } from "+api/models/ModuleDto"
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

export type Module = {
	type: "module"
	id: TaskId
	path: Reactive<string>
	name: Computed<string>
	status: Reactive<TaskStatus>
	duration: Reactive<Duration | null>
	errors: Reactive<Array<unknown>>
}

export type Modules = Array<Module>

const modulesById: Reactive<Record<TaskId, Module>> = signal({})

export function initialiseModules(dtos: Array<ModuleDto>): void {
	modulesById.value = Object.fromEntries(
		dtos.map(dtoToModule).map((module) => [module.id, module]),
	)
}

export function dtoToModule(dto: ModuleDto): Module {
	const path = signal(dto.path)

	return {
		type: "module",
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

export function moduleToDto(module: Module): ModuleDto {
	return {
		type: "module",
		id: module.id,
		path: module.path.value,
		status: module.status.value,
		duration: module.duration.value,
		errors: module.errors.value,
	}
}

const byName: Comparator<Module> = (a, b) =>
	a.name.peek().localeCompare(b.name.peek()) // `peek()` suffices as `name` does not change once a `Module` is instantiated. A renamed module results in a new `Module` instance.

export function useModules(): Computed<Modules> {
	const cachedModules = useRef<Modules>([])

	return useComputed<Modules>(() => {
		const modules = Array.from(enumerateModules()).sort(byName)

		if (arrayEquals(cachedModules.current, modules)) {
			return cachedModules.current
		}

		cachedModules.current = modules
		return modules
	})
}

export function useModule(moduleId: TaskId): Computed<Module | null> {
	return useComputed(() => getModuleById(moduleId))
}

export function getModuleById(moduleId: TaskId): Module | null {
	return modulesById.value[moduleId] ?? null
}

export function addModule(module: Module): void {
	modulesById.value = { ...modulesById.value, [module.id]: module }
}

export function updateModule(
	existingModule: Module,
	updatedModule: ModuleDto,
): void {
	const updatedStatus = updatedModule.status

	existingModule.path.value = updatedModule.path
	existingModule.status.value = updatedStatus
	existingModule.duration.value =
		updatedStatus === "failed" || updatedStatus === "passed"
			? updatedModule.duration
			: null
}

export function* enumerateModulesById(
	moduleIds: Iterable<TaskId>,
): Iterable<Module> {
	for (const moduleId of moduleIds) {
		const module = getModuleById(moduleId)

		if (module !== null) {
			yield module
		}
	}
}

export function enumerateModulesByStatuses(
	statusesToInclude: Array<TaskStatus>,
): Iterable<Module> {
	const statuses = new Set(statusesToInclude)

	return filterIterable(enumerateModules(), (module) =>
		statuses.has(module.status.value),
	)
}

export function enumerateModules(): Iterable<Module> {
	return enumerateObjectValues(modulesById.value)
}

export function removeModulesByPath(path: string): void {
	modulesById.value = filterObjectByValue(
		modulesById.value,
		(module) => module.path.value !== path,
	)
}

export function removeModulesByStatuses(
	statusesToRemove: Array<TaskStatus>,
): void {
	const statuses = new Set(statusesToRemove)

	modulesById.value = filterObjectByValue(
		modulesById.value,
		(module) => !statuses.has(module.status.value),
	)
}

export function removeAllModules(): void {
	modulesById.value = {}
}
