import { MaybePromise, Query, Update } from "../types";


export default abstract class Plugin<
  T,
  D extends T = T,
  F extends Query<T> = Query<T>,
  U extends Update<T> = Update<T>
> {
  beforeInsert(options: { data: D[] }): MaybePromise<{ data: D[] }> {
    return options;
  }

  inserted(options: { data: D[] }): MaybePromise<{ data: D[] }> {
    return options;
  }

  beforeUpdate(options: { query: F; update: U }): MaybePromise<{
    query: F;
    update: U;
  }> {
    return options;
  }

  updated(options: { query: F; update: U; data: D[] }): MaybePromise<{
    query: F;
    update: U;
    data: D[];
  }> {
    return options;
  }

  beforeRemove(options: { query: F }): MaybePromise<{ query: F }> {
    return options;
  }

  removed(options: {
    query: F;
    data: D[];
  }): MaybePromise<{ query: F; data: D[] }> {
    return options;
  }

  beforeFind(options: { query: F }): MaybePromise<{ query: F }> {
    return options;
  }

  found(options: { query: F; data: D[] }): MaybePromise<{ query: F; data: D[] }> {
    return options;
  }

  beforeFindOne(options: { query: F }): MaybePromise<{ query: F }> {
    return options;
  }

  foundOne(options: { query: F; data: D | null }): MaybePromise<{
    query: F;
    data: D | null;
  }> {
    return options;
  }
}
