import type { Flavour } from "+types/Flavour"

export type ModuleId = string & Flavour<"ModuleId">
export type ModuleIds = Array<ModuleId>
