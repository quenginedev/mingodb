type PluginFn = <T>(data: T) => T
type HookField = { pre?: Array<PluginFn>, post?: Array<PluginFn> }

export type Hook = {
  init?: HookField,
  insertOne?: HookField,
  insertMany?: HookField,
  findOne?: HookField
  findMany?: HookField
  updateOne?: HookField
  updateMany?: HookField
  deleteOne?: HookField
  deleteMany?: HookField
}

export type HookFn = (hook: Hook) => Hook
