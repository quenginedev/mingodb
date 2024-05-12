import Plugin from ".";
import { MaybePromise, Query, Update } from "../types";

export default class TimestampPlugin<T, TimeStamp = { createdAt: string; updatedAt: string; }> extends Plugin<
  T,
  T & TimeStamp
> {
  beforeInsert(options: { data: (T & TimeStamp)[]; }): MaybePromise<{ data: (T & TimeStamp)[]; }> {
    return {
      data: options.data.map((doc) => ({
        ...doc,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };
  }

  beforeUpdate(options: { query: Query<T>; update: Update<T> }): MaybePromise<{ query: Query<T>; update: Update<T>; }> {
    options.update.$set = { ...options.update.$set, updatedAt: new Date().toISOString() };
    return options
  }
}