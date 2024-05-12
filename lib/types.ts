import type { FilterQuery, UpdateQuery } from "mongoose";

export type MaybePromise<T> = T | Promise<T>;
export type Query<T> = FilterQuery<T>;
export type Update<T> = UpdateQuery<T>;
